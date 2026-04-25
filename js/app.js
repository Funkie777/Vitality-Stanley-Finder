import { SEED_GRIDS }                           from './seed-grids.js';
import { getBestTap, probTier, ALL_POSITIONS } from './predictor.js';
import { fetchRedditGrids, clearRedditCache }   from './reddit-api.js';
import { fetchGitHubGrids, clearGitHubCache, buildSubmissionURL } from './github-issues.js';

// ── Constants ──────────────────────────────────────────────────────────────
const MAX_TAPS = 3;

const MARKERS = {
  plain:  { emoji: '🌿', label: 'Plain'  },
  flower: { emoji: '🌸', label: 'Flower' },
  berry:  { emoji: '🫐', label: 'Berry'  },
  leaf:   { emoji: '🍃', label: 'Leaf'   },
};

// ── App state ──────────────────────────────────────────────────────────────
const state = {
  grids:            [...SEED_GRIDS],
  phase:            'select-starter',
  starterPos:       null,
  taps:             [],        // [{pos, result:'hit'|'miss', marker}]
  markers:          {},        // pos → marker key
  selectedCell:     null,      // cell shown in action panel
  pendingMarker:    null,      // marker selected but not yet recorded
  revealedPositions: new Set(), // complete-phase: all confirmed Stanley positions
  prediction:       null,
  week:             currentWeek(),
};

// ── Helpers ────────────────────────────────────────────────────────────────
function currentWeek() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week  = Math.ceil(((now - start) / 86_400_000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function hits()   { return state.taps.filter(t => t.result === 'hit').map(t => t.pos); }
function misses() { return state.taps.filter(t => t.result === 'miss').map(t => t.pos); }
function pct(p)   { return Math.round(p * 100); }

function $ (id)  { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }

// ── Grid rendering ─────────────────────────────────────────────────────────
function renderGrid(containerId, { clickable = false, showProbs = false } = {}) {
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = '';

  const knownHits   = hits();
  const knownMisses = misses();

  for (const pos of ALL_POSITIONS) {
    const cell = document.createElement('button');
    cell.className   = 'grid-cell';
    cell.dataset.pos = pos;
    cell.type        = 'button';

    let stateClass = '';
    let inner      = '';

    if (pos === state.starterPos) {
      stateClass = 'state-starter';
      inner = '<span class="cell-main">🦔</span>';
    } else if (knownHits.includes(pos)) {
      stateClass = 'state-hit';
      inner = '<span class="cell-main">🦔</span>';
    } else if (knownMisses.includes(pos)) {
      stateClass = 'state-miss';
      inner = '<span class="cell-main">✗</span>';
    } else if (pos === state.selectedCell) {
      stateClass = 'state-selected';
      inner = '<span class="cell-main">?</span>';
    } else if (showProbs && state.prediction) {
      const prob = state.prediction.probs[pos] ?? 0;
      const tier = probTier(prob);
      const isRec = pos === state.prediction.recommended?.pos;
      stateClass = `state-${tier}${isRec ? ' recommended' : ''}`;
      inner = prob > 0
        ? `<span class="cell-pct">${pct(prob)}%</span>`
        : '<span class="cell-pct" style="opacity:.3">—</span>';
    } else {
      stateClass = 'state-zero';
    }

    cell.classList.add(...stateClass.split(' '));
    inner += `<span class="cell-pos">${pos}</span>`;
    cell.innerHTML = inner;

    const marker = state.markers[pos];
    if (marker && marker !== 'plain') {
      const pip = document.createElement('span');
      pip.className   = 'marker-pip';
      pip.textContent = MARKERS[marker]?.emoji ?? '';
      cell.appendChild(pip);
    }

    if (clickable) {
      cell.addEventListener('click', () => handleCellClick(pos));
    } else {
      cell.disabled = true;
    }

    container.appendChild(cell);
  }
}

// ── Phase: select-starter ──────────────────────────────────────────────────
function enterSelectStarter() {
  state.phase            = 'select-starter';
  state.starterPos       = null;
  state.taps             = [];
  state.markers          = {};
  state.selectedCell     = null;
  state.pendingMarker    = null;
  state.revealedPositions = new Set();
  state.prediction       = null;

  showPhase('phase-starter');
  renderGrid('starter-grid', { clickable: true });

  $('starter-marker-panel').classList.add('hidden');
  $('btn-start-predict').classList.add('hidden');
  $$('#starter-marker-buttons .marker-btn').forEach(b => b.classList.remove('selected'));
}

function handleStarterCellClick(pos) {
  state.starterPos = pos;

  $$('#starter-grid .grid-cell').forEach(c => {
    const isSelected = c.dataset.pos === pos;
    c.className = 'grid-cell ' + (isSelected ? 'state-starter' : 'state-zero');
    c.innerHTML = isSelected
      ? `<span class="cell-main">🦔</span><span class="cell-pos">${pos}</span>`
      : `<span class="cell-pos">${c.dataset.pos}</span>`;
  });

  $('starter-marker-panel').classList.remove('hidden');
  $('btn-start-predict').classList.remove('hidden');
}

// ── Phase: playing ─────────────────────────────────────────────────────────
function enterPlaying() {
  state.phase = 'playing';
  showPhase('phase-predict');
  refreshPrediction();
  updateStatusBar();
}

// Recalculate prediction and update the action panel for the recommended cell.
function refreshPrediction() {
  state.prediction = getBestTap(
    state.grids, state.starterPos, hits(), misses(), state.markers
  );

  // Auto-select the recommended cell
  const rec = state.prediction?.recommended;
  state.selectedCell  = rec?.pos ?? null;
  state.pendingMarker = null;

  renderGrid('play-grid', { clickable: true, showProbs: true });
  updatePredictionCard();
  updateActionPanel();
  resetMarkerButtons();
}

function updatePredictionCard() {
  const p   = state.prediction;
  const rec = p?.recommended;

  if (!rec || p.matchCount === 0) {
    $('pred-pos').textContent    = '?';
    $('pred-detail').textContent = p?.matchCount === 0
      ? 'No matching grids yet — your taps add new data!'
      : 'Calculating…';
    $('pred-alts').innerHTML = '';
    return;
  }

  $('pred-pos').textContent    = rec.pos;
  $('pred-detail').textContent =
    `${pct(rec.prob)}% chance · ${p.matchCount} grid${p.matchCount !== 1 ? 's' : ''} match`;

  const alts = p.alternatives.filter(a => a.prob > 0);
  $('pred-alts').innerHTML = alts.length
    ? 'Also: ' + alts.map(a =>
        `<span class="pred-alt-chip">${a.pos} ${pct(a.prob)}%</span>`
      ).join('')
    : '';
}

// Show the action panel with the current selectedCell pre-filled.
function updateActionPanel() {
  if (state.selectedCell) {
    $('tap-action-label').textContent = `You tapped ${state.selectedCell} — record below:`;
  } else {
    $('tap-action-label').textContent = 'Select a tile above to record your tap';
  }
}

function resetMarkerButtons() {
  $$('#tap-marker-buttons .marker-btn').forEach(b => b.classList.remove('selected'));
}

// Called when user taps a cell on the play grid.
function handlePlayCellClick(pos) {
  const known = new Set([state.starterPos, ...hits(), ...misses()]);
  if (known.has(pos)) return;

  state.selectedCell  = pos;
  state.pendingMarker = null;
  resetMarkerButtons();
  renderGrid('play-grid', { clickable: true, showProbs: true });
  updateActionPanel();
}

// Called by Hit / Miss buttons.
function recordResult(result) {
  if (!state.selectedCell) return;

  const marker = state.pendingMarker ?? 'plain';
  state.taps.push({ pos: state.selectedCell, result, marker });
  if (marker !== 'plain') state.markers[state.selectedCell] = marker;

  state.selectedCell  = null;
  state.pendingMarker = null;

  if (isGameOver()) {
    enterComplete();
  } else {
    refreshPrediction();
    updateStatusBar();
  }
}

function isGameOver() {
  return state.taps.length >= MAX_TAPS || hits().length >= MAX_TAPS;
}

function updateStatusBar() {
  const tapsLeft   = MAX_TAPS - state.taps.length;
  const found      = 1 + hits().length;
  const matchCount = state.prediction?.matchCount ?? '—';

  $('stat-taps').textContent  = `${tapsLeft} tap${tapsLeft !== 1 ? 's' : ''} left`;
  $('stat-found').textContent = `${found} / 4 found`;
  $('stat-grids').textContent = `${matchCount} grid${matchCount !== 1 ? 's' : ''} match`;
}

// ── Phase: complete ────────────────────────────────────────────────────────
function enterComplete() {
  state.phase = 'complete';
  showPhase('phase-complete');

  // Pre-populate revealed positions with what we already confirmed
  state.revealedPositions = new Set([state.starterPos, ...hits()]);

  saveSession();
  renderRevealGrid();
}

// Render the interactive "reveal final grid" in the complete phase.
function renderRevealGrid() {
  const container = $('reveal-grid');
  if (!container) return;
  container.innerHTML = '';

  const knownHits   = hits();
  const knownMisses = misses();

  for (const pos of ALL_POSITIONS) {
    const cell = document.createElement('button');
    cell.dataset.pos = pos;
    cell.type        = 'button';
    cell.className   = 'grid-cell';

    const isStarter   = pos === state.starterPos;
    const isHit       = knownHits.includes(pos);
    const isMiss      = knownMisses.includes(pos);
    const isRevealed  = state.revealedPositions.has(pos);

    if (isStarter || isHit) {
      // Confirmed Stanley — locked
      cell.classList.add('state-hit');
      cell.innerHTML = `<span class="cell-main">🦔</span><span class="cell-pos">${pos}</span>`;
      cell.disabled  = true;
    } else if (isMiss) {
      // Confirmed non-Stanley from tap — locked
      cell.classList.add('state-miss');
      cell.innerHTML = `<span class="cell-main">✗</span><span class="cell-pos">${pos}</span>`;
      cell.disabled  = true;
    } else if (isRevealed) {
      // User marked this as a missed Stanley
      cell.classList.add('state-revealed');
      cell.innerHTML = `<span class="cell-main">🦔</span><span class="cell-pos">${pos}</span>`;
      cell.addEventListener('click', () => toggleRevealedPos(pos));
    } else {
      // Unknown — tappable
      cell.classList.add('state-zero');
      cell.innerHTML = `<span class="cell-pos">${pos}</span>`;
      cell.addEventListener('click', () => toggleRevealedPos(pos));
    }

    // Marker pip
    const marker = state.markers[pos];
    if (marker && marker !== 'plain') {
      const pip = document.createElement('span');
      pip.className   = 'marker-pip';
      pip.textContent = MARKERS[marker]?.emoji ?? '';
      cell.appendChild(pip);
    }

    container.appendChild(cell);
  }

  // Update score and emoji based on currently revealed positions
  const total = state.revealedPositions.size;
  $('final-score').textContent  = `${total} / 4`;
  $('complete-emoji').textContent =
    total === 4 ? '🎉' : total >= 3 ? '🦔' : total >= 2 ? '😊' : '😔';

  updateSubmitButton();
}

function toggleRevealedPos(pos) {
  if (state.revealedPositions.has(pos)) {
    state.revealedPositions.delete(pos);
  } else {
    if (state.revealedPositions.size < 4) {
      state.revealedPositions.add(pos);
    }
  }
  renderRevealGrid();
}

function updateSubmitButton() {
  const url = buildSubmissionURL({
    starterPos: state.starterPos,
    stanleys:   [...state.revealedPositions],
    misses:     misses(),
    markers:    state.markers,
    week:       state.week,
  });

  const btn = $('btn-submit');
  if (url) {
    btn.href = url;
    btn.style.opacity        = '';
    btn.style.pointerEvents  = '';
  } else {
    btn.href                 = '#';
    btn.style.opacity        = '0.4';
    btn.style.pointerEvents  = 'none';
  }
}

// ── History ────────────────────────────────────────────────────────────────
function saveSession() {
  const history = loadHistory();
  history.unshift({
    week:       state.week,
    starterPos: state.starterPos,
    found:      1 + hits().length,
    taps:       state.taps,
    markers:    state.markers,
    timestamp:  Date.now(),
  });
  if (history.length > 30) history.splice(30);
  try { localStorage.setItem('vsf_history', JSON.stringify(history)); } catch {}
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('vsf_history') ?? '[]'); } catch { return []; }
}

function renderHistory() {
  const history = loadHistory();
  const el      = $('history-list');

  if (history.length === 0) {
    el.innerHTML = '<p class="empty-state">No sessions yet — play your first week!</p>';
    return;
  }

  el.innerHTML = history.map(s => {
    const tapSummary = s.taps.map(t =>
      `${t.pos}:${t.result === 'hit' ? '🦔' : '✗'}`
    ).join('  ');
    return `
      <div class="history-item">
        <div class="history-score">${s.found}/4</div>
        <div class="history-detail">
          <div class="history-week">${s.week}</div>
          <div class="history-starter">Starter: ${s.starterPos}</div>
          <div class="history-taps">${tapSummary || 'No taps recorded'}</div>
        </div>
      </div>`;
  }).join('');
}

// ── Community tab ──────────────────────────────────────────────────────────
function renderCommunity(filterStarter = '') {
  const bySource = { seed: 0, reddit: 0, community: 0 };
  for (const g of state.grids) bySource[g.source] = (bySource[g.source] ?? 0) + 1;

  $('count-seed').textContent      = bySource.seed      ?? 0;
  $('count-reddit').textContent    = bySource.reddit    ?? 0;
  $('count-community').textContent = bySource.community ?? 0;
  $('count-total').textContent     = state.grids.length;

  const starters = [...new Set(state.grids.map(g => g.starter).filter(Boolean))].sort();
  const sel      = $('starter-filter');
  const current  = sel.value;
  sel.innerHTML  = '<option value="">All starters</option>' +
    starters.map(s => `<option value="${s}">${s}</option>`).join('');
  if (current) sel.value = current;

  const filtered = filterStarter
    ? state.grids.filter(g => g.starter === filterStarter)
    : state.grids;

  const el = $('community-list');
  if (filtered.length === 0) {
    el.innerHTML = '<p class="empty-state">No grids found. Try refreshing or submit your own!</p>';
    return;
  }

  const grouped = {};
  for (const g of filtered) {
    const key = g.starter ?? '?';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(g);
  }

  el.innerHTML = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([starter, grids]) => {
      const sample     = grids[0];
      const badgeClass = `badge-${sample.source}`;
      const miniGrid   = buildMiniGrid(sample.stanleys ?? [], starter);
      const markersStr = Object.entries(sample.markers ?? {})
        .filter(([, v]) => v && v !== 'plain')
        .map(([pos, m]) => `${pos}:${MARKERS[m]?.emoji ?? m}`)
        .join(' ') || '';

      return `
        <div class="community-item">
          <div class="community-item-header">
            <span class="source-badge ${badgeClass}">${sample.source}</span>
            <span class="community-starter">Starter: ${starter}</span>
          </div>
          ${miniGrid}
          <div class="community-stanleys">Stanleys: ${(sample.stanleys ?? []).join(', ') || '—'}</div>
          ${markersStr ? `<div class="community-markers">Markers: ${markersStr}</div>` : ''}
          <div class="community-meta">
            ${grids.length} variant${grids.length !== 1 ? 's' : ''} known
            · confidence ${Math.round((sample.confidence ?? 0.5) * 100)}%
            ${sample.submittedAt ? '· ' + sample.submittedAt.slice(0, 10) : ''}
          </div>
        </div>`;
    }).join('');
}

function buildMiniGrid(stanleys, starter) {
  let html = '<div class="mini-grid">';
  for (const pos of ALL_POSITIONS) {
    const isSt = pos === starter;
    const isS  = stanleys.includes(pos);
    html += `<div class="mini-cell${isSt ? ' is-starter' : isS ? ' is-stanley' : ''}"></div>`;
  }
  return html + '</div>';
}

// ── Data loading ───────────────────────────────────────────────────────────
async function loadAllData() {
  $('data-loading-notice').textContent = 'Fetching Reddit & community grids…';

  try {
    const [redditResult, githubResult] = await Promise.allSettled([
      fetchRedditGrids(),
      fetchGitHubGrids(),
    ]);

    const reddit = redditResult.status === 'fulfilled' ? redditResult.value : [];
    const github = githubResult.status === 'fulfilled' ? githubResult.value : [];

    state.grids = [...SEED_GRIDS, ...reddit, ...github];

    $('data-loading-notice').textContent =
      `${state.grids.length} grids loaded (${reddit.length} Reddit · ${github.length} community)`;

    if (state.phase === 'playing') { refreshPrediction(); updateStatusBar(); }
    if ($('tab-community').classList.contains('active')) renderCommunity();

  } catch (e) {
    console.warn('[App] Data load error:', e);
    $('data-loading-notice').textContent = 'Using seed data only (network unavailable)';
  }
}

async function refreshData() {
  clearRedditCache();
  clearGitHubCache();
  $('data-loading-notice').textContent = 'Refreshing…';
  await loadAllData();
}

// ── Shared cell click dispatcher ───────────────────────────────────────────
function handleCellClick(pos) {
  if (state.phase === 'select-starter') handleStarterCellClick(pos);
  else if (state.phase === 'playing')   handlePlayCellClick(pos);
}

// ── Phase helper ───────────────────────────────────────────────────────────
function showPhase(id) {
  $$('.phase').forEach(el => el.classList.add('hidden'));
  $(id)?.classList.remove('hidden');
}

function switchTab(name) {
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  $$('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${name}`));
}

// ── Event wiring ───────────────────────────────────────────────────────────
function wireEvents() {
  // Tab navigation
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach(t => t.classList.remove('active'));
      $$('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      $(`tab-${tab.dataset.tab}`)?.classList.add('active');
      if (tab.dataset.tab === 'history')   renderHistory();
      if (tab.dataset.tab === 'community') renderCommunity($('starter-filter').value);
    });
  });

  // Starter marker buttons
  $$('#starter-marker-buttons .marker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#starter-marker-buttons .marker-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (state.starterPos) state.markers[state.starterPos] = btn.dataset.marker;
    });
  });

  // Start predicting
  $('btn-start-predict').addEventListener('click', () => {
    if (!state.starterPos) return;
    enterPlaying();
  });

  // Tap marker buttons (select without auto-proceeding)
  $$('#tap-marker-buttons .marker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#tap-marker-buttons .marker-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.pendingMarker = btn.dataset.marker;
    });
  });

  // Hit / Miss — these record the result and drive the next cycle
  $('btn-hit').addEventListener('click',  () => recordResult('hit'));
  $('btn-miss').addEventListener('click', () => recordResult('miss'));

  // End session early
  $('btn-end-early').addEventListener('click', () => {
    if (!state.starterPos) return;
    enterComplete();
  });

  // New week
  $('btn-new-week').addEventListener('click', () => {
    state.week = currentWeek();
    $('week-label').textContent = state.week;
    enterSelectStarter();
    switchTab('play');
  });

  // Community refresh
  $('btn-refresh').addEventListener('click', refreshData);

  // Community starter filter
  $('starter-filter').addEventListener('change', e => renderCommunity(e.target.value));
}

// ── Boot ───────────────────────────────────────────────────────────────────
function init() {
  $('week-label').textContent = state.week;
  wireEvents();
  enterSelectStarter();
  loadAllData();
}

document.addEventListener('DOMContentLoaded', init);
