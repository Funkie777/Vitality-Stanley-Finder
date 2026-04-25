// Prediction engine: filters known grids against session state and
// calculates per-cell Stanley probabilities.

export const ALL_POSITIONS = [];
for (let r = 1; r <= 4; r++)
  for (let c = 1; c <= 4; c++)
    ALL_POSITIONS.push(`R${r}C${c}`);

// Return grids compatible with the current session evidence.
export function filterGrids(grids, starterPos, hits, misses, markers = {}) {
  return grids.filter(grid => {
    const s = new Set(grid.stanleys);

    if (!s.has(starterPos)) return false;
    if (hits.some(h => !s.has(h))) return false;
    if (misses.some(m => s.has(m))) return false;

    // Optional marker compatibility: skip grids that contradict a noted marker
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
export function getProbabilities(grids, starterPos, hits, misses, markers = {}) {
  const matching = filterGrids(grids, starterPos, hits, misses, markers);
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
export function getBestTap(grids, starterPos, hits, misses, markers = {}) {
  const { probs, matchCount, totalGrids } = getProbabilities(
    grids, starterPos, hits, misses, markers
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
