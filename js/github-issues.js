// Read community-submitted grids from GitHub Issues, and build a pre-filled
// issue URL so users can submit their own grid without needing app auth.

import { normaliseGrid, isValidPos } from './parser.js';

const REPO       = 'funkie777/vitality-stanley-finder';
const LABEL      = 'grid-submission';
const API_URL    = `https://api.github.com/repos/${REPO}/issues`;
const CACHE_KEY  = 'vsf_github_cache';
const CACHE_TTL  = 15 * 60 * 1000; // 15 minutes

// Parse the standardised issue body format into a grid object.
function parseIssueBody(body, issueNumber, createdAt) {
  if (!body) return null;

  // Starter position
  const starterM = body.match(/\*\*Starter(?:\s+Position)?:\*\*\s*(R[1-4]C[1-4])/i);
  const starter  = starterM ? starterM[1].toUpperCase() : null;

  // Stanley positions — one per line with "- RxCy" or comma-separated
  const posSection = body.match(/###\s*Stanley Positions\s*([\s\S]*?)(?:###|$)/i);
  const stanleys = [];

  if (posSection) {
    for (const m of posSection[1].matchAll(/R([1-4])C([1-4])/gi)) {
      stanleys.push(`R${m[1]}C${m[2]}`);
    }
  }

  if (stanleys.length < 2) return null; // Not enough data

  // Confirmed misses (not-Stanleys)
  const missSection = body.match(/###\s*Confirmed Not-Stanleys?\s*([\s\S]*?)(?:###|$)/i);
  const misses = [];
  if (missSection) {
    for (const m of missSection[1].matchAll(/R([1-4])C([1-4])/gi)) {
      misses.push(`R${m[1]}C${m[2]}`);
    }
  }

  // Visual markers
  const markerSection = body.match(/###\s*Visual Markers\s*([\s\S]*?)(?:###|$)/i);
  const markers = {};
  if (markerSection) {
    for (const m of markerSection[1].matchAll(/R([1-4])C([1-4])\s*:\s*(flower|berry|leaf|plain|none)/gi)) {
      const pos    = `R${m[1]}C${m[2]}`;
      const marker = m[3].toLowerCase();
      if (marker !== 'plain' && marker !== 'none') markers[pos] = marker;
    }
  }

  // If we have 4 confirmed stanleys, great. Otherwise note it's partial.
  const resolvedStarter = starter ?? stanleys[0];
  const confidence      = stanleys.length === 4 ? 0.8 : 0.6;

  return normaliseGrid({
    id:          `gh-${issueNumber}`,
    starter:     resolvedStarter,
    stanleys,
    misses,       // partial sessions may have confirmed misses
    markers,
    source:      'community',
    confidence,
    issueNumber,
    submittedAt: createdAt,
  });
}

export async function fetchGitHubGrids() {
  // Return cached data if fresh
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { grids, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp < CACHE_TTL) return grids;
    }
  } catch {/* ignore */}

  const grids = [];
  let page    = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const url = `${API_URL}?labels=${LABEL}&state=open&per_page=100&page=${page}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (!res.ok) break;

      const issues = await res.json();
      if (!Array.isArray(issues) || issues.length === 0) { hasMore = false; break; }

      for (const issue of issues) {
        const grid = parseIssueBody(issue.body, issue.number, issue.created_at);
        if (grid) grids.push(grid);
      }

      hasMore = issues.length === 100;
      page++;
    }
  } catch (e) {
    console.warn('[GitHub] Issues fetch failed:', e.message);
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ grids, timestamp: Date.now() }));
  } catch {/* storage full */}

  return grids;
}

export function clearGitHubCache() {
  localStorage.removeItem(CACHE_KEY);
}

// Build a pre-filled GitHub new-issue URL so users can submit a grid.
export function buildSubmissionURL(session) {
  const { starterPos, taps = [], markers = {}, week } = session;
  if (!starterPos) return null;

  const hits  = taps.filter(t => t.result === 'hit').map(t => t.pos);
  const misses = taps.filter(t => t.result === 'miss').map(t => t.pos);
  const stanleys = [starterPos, ...hits];

  const markerLines = Object.entries(markers)
    .filter(([, v]) => v && v !== 'plain')
    .map(([pos, m]) => `- ${pos}: ${m}`)
    .join('\n') || 'None noted';

  const missLines = misses.length > 0
    ? misses.map(p => `- ${p}`).join('\n')
    : 'None';

  const body = `## Stanley Grid Submission

**Starter Position:** ${starterPos}
**Week:** ${week ?? 'unknown'}

### Stanley Positions
${stanleys.map(p => `- ${p}${p === starterPos ? ' (starter — guaranteed)' : ''}`).join('\n')}

### Confirmed Not-Stanleys
${missLines}

### Visual Markers
${markerLines}

### Result
Found: ${stanleys.length}/4 Stanleys

### Notes
<!-- Optional: any observations about this board, e.g. unusual bush patterns -->

---
*Submitted via [Stanley Finder](https://funkie777.github.io/vitality-stanley-finder/)*`;

  const title = `[GRID] Starter: ${starterPos} | Week: ${week ?? 'unknown'}`;

  return (
    `https://github.com/${REPO}/issues/new` +
    `?labels=${encodeURIComponent(LABEL)}` +
    `&title=${encodeURIComponent(title)}` +
    `&body=${encodeURIComponent(body)}`
  );
}
