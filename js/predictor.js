// Prediction engine: filters known grids against session state and
// calculates per-cell Stanley probabilities.

export const ALL_POSITIONS = [];
for (let r = 1; r <= 4; r++)
  for (let c = 1; c <= 4; c++)
    ALL_POSITIONS.push(`R${r}C${c}`);

// Return grids compatible with the current session evidence.
// confirmedMisses: { [starterPos]: string[] } — positions confirmed as
// non-Stanley in 2+ community sessions for this starter.  These are used to
// discard seed grids that contradict real-world data.
export function filterGrids(grids, starterPos, hits, misses, markers = {}, confirmedMisses = {}) {
  const commMisses = new Set(confirmedMisses[starterPos] ?? []);

  return grids.filter(grid => {
    const s = new Set(grid.stanleys);

    if (!s.has(starterPos)) return false;
    if (hits.some(h => !s.has(h))) return false;
    if (misses.some(m => s.has(m))) return false;

    // Discard grids that list a community-confirmed non-Stanley as a Stanley
    if (commMisses.size > 0 && [...commMisses].some(m => s.has(m))) return false;

    // Marker compatibility: skip grids that contradict a noted marker
    if (Object.keys(markers).length > 0 && grid.markers && Object.keys(grid.markers).length > 0) {
      for (const [pos, markerType] of Object.entries(markers)) {
        if (markerType === 'plain') continue;
        if (grid.markers[pos] && grid.markers[pos] !== markerType) return false;
      }
    }

    return true;
  });
}

// Calculate P(Stanley) for every untapped cell given current session.
export function getProbabilities(grids, starterPos, hits, misses, markers = {}, confirmedMisses = {}) {
  const matching = filterGrids(grids, starterPos, hits, misses, markers, confirmedMisses);
  const known = new Set([starterPos, ...hits, ...misses]);
  const n = matching.length;

  const probs = {};
  for (const pos of ALL_POSITIONS) {
    if (known.has(pos)) continue;
    probs[pos] = n > 0
      ? matching.filter(g => g.stanleys.includes(pos)).length / n
      : 0;
  }

  return { probs, matchCount: n, totalGrids: grids.length };
}

// Get the best tap recommendation plus alternatives.
export function getBestTap(grids, starterPos, hits, misses, markers = {}, confirmedMisses = {}) {
  const { probs, matchCount, totalGrids } = getProbabilities(
    grids, starterPos, hits, misses, markers, confirmedMisses
  );

  const sorted = Object.entries(probs).sort((a, b) => b[1] - a[1]);

  return {
    recommended: sorted[0] ? { pos: sorted[0][0], prob: sorted[0][1] } : null,
    alternatives: sorted.slice(1, 4).map(([pos, prob]) => ({ pos, prob })),
    probs,
    matchCount,
    totalGrids,
  };
}

// Classify probability into display tier
export function probTier(prob) {
  if (prob >= 0.5)  return 'high';
  if (prob >= 0.25) return 'medium';
  if (prob > 0)     return 'low';
  return 'zero';
}

// Build a map of positions confirmed as non-Stanley across community sessions.
// A position needs threshold or more sessions confirming it as a miss for this
// starter before it's used to filter grids (avoids acting on single bad data).
export function computeConfirmedMisses(grids, threshold = 2) {
  const counts = {};

  for (const g of grids) {
    if (!g.misses?.length || !g.starter) continue;
    if (!counts[g.starter]) counts[g.starter] = {};
    for (const m of g.misses) {
      counts[g.starter][m] = (counts[g.starter][m] ?? 0) + 1;
    }
  }

  const confirmed = {};
  for (const [starter, posMap] of Object.entries(counts)) {
    const positions = Object.keys(posMap).filter(p => posMap[p] >= threshold);
    if (positions.length > 0) confirmed[starter] = positions;
  }

  return confirmed;
}
