// Seed grids: example/community-reported layouts to bootstrap predictions.
// All are marked source:'seed' and confidence:0.5 — they demonstrate the app
// but should be replaced by real crowdsourced data over time.
// Format: stanleys = all 4 Stanley positions including the starter.

// Seed grids: example/community-reported layouts to bootstrap predictions.
// All are marked source:'seed' and confidence:0.5 — they demonstrate the app
// but should be replaced by real crowdsourced data over time.
// Format: stanleys = all 4 Stanley positions including the starter.

// Community-sourced grids: manually transcribed from the Reddit completed-grids
// collection posted by u/lonely_peppercorn. Positions are best-effort readings
// from screenshots — verify via the community submission flow if uncertain.
// source:'reddit-manual', confidence:0.7

const COMMUNITY_GRIDS = [
  // ── R1C1 starters ─────────────────────────────────────────────────────────
  // ⚠ R2C4 and R3C2 both confirmed NOT for R1C1 — confidence lowered
  { id: 'rm-r1c1-a', starter: 'R1C1', stanleys: ['R1C1', 'R2C4', 'R3C2', 'R4C3'], markers: {}, source: 'reddit-manual', confidence: 0.15 },

  // ── R1C3 starters ─────────────────────────────────────────────────────────
  { id: 'rm-r1c3-a', starter: 'R1C3', stanleys: ['R1C3', 'R2C4', 'R3C1', 'R4C2'], markers: {}, source: 'reddit-manual', confidence: 0.7 },

  // ── R1C4 starters ─────────────────────────────────────────────────────────
  { id: 'rm-r1c4-a', starter: 'R1C4', stanleys: ['R1C4', 'R2C3', 'R3C2', 'R4C1'], markers: {}, source: 'reddit-manual', confidence: 0.7 },

  // ── R2C1 starters ─────────────────────────────────────────────────────────
  { id: 'rm-r2c1-a', starter: 'R2C1', stanleys: ['R2C1', 'R1C3', 'R3C4', 'R4C2'], markers: {}, source: 'reddit-manual', confidence: 0.7 },
  { id: 'rm-r2c1-b', starter: 'R2C1', stanleys: ['R2C1', 'R1C2', 'R3C4', 'R4C3'], markers: {}, source: 'reddit-manual', confidence: 0.7 },

  // ── R2C2 starters ─────────────────────────────────────────────────────────
  { id: 'rm-r2c2-a', starter: 'R2C2', stanleys: ['R2C2', 'R1C1', 'R3C4', 'R4C3'], markers: {}, source: 'reddit-manual', confidence: 0.7 },
  { id: 'rm-r2c2-b', starter: 'R2C2', stanleys: ['R2C2', 'R1C4', 'R3C1', 'R4C3'], markers: {}, source: 'reddit-manual', confidence: 0.7 },

  // ── R3C1 starters ─────────────────────────────────────────────────────────
  { id: 'rm-r3c1-a', starter: 'R3C1', stanleys: ['R3C1', 'R1C2', 'R2C4', 'R4C3'], markers: {}, source: 'reddit-manual', confidence: 0.7 },

  // ── R3C2 starters ─────────────────────────────────────────────────────────
  { id: 'rm-r3c2-a', starter: 'R3C2', stanleys: ['R3C2', 'R1C4', 'R2C1', 'R4C3'], markers: {}, source: 'reddit-manual', confidence: 0.7 },

  // ── R3C3 starters ─────────────────────────────────────────────────────────
  { id: 'rm-r3c3-a', starter: 'R3C3', stanleys: ['R3C3', 'R1C1', 'R2C4', 'R4C2'], markers: {}, source: 'reddit-manual', confidence: 0.7 },

  // ── R4C1 starters ─────────────────────────────────────────────────────────
  { id: 'rm-r4c1-a', starter: 'R4C1', stanleys: ['R4C1', 'R1C4', 'R2C2', 'R3C3'], markers: {}, source: 'reddit-manual', confidence: 0.7 },
  { id: 'rm-r4c1-b', starter: 'R4C1', stanleys: ['R4C1', 'R1C3', 'R2C2', 'R3C4'], markers: {}, source: 'reddit-manual', confidence: 0.7 },

  // ── R4C2 starters ─────────────────────────────────────────────────────────
  { id: 'rm-r4c2-a', starter: 'R4C2', stanleys: ['R4C2', 'R1C1', 'R2C4', 'R3C3'], markers: {}, source: 'reddit-manual', confidence: 0.7 },

  // ── R4C3 starters ─────────────────────────────────────────────────────────
  { id: 'rm-r4c3-a', starter: 'R4C3', stanleys: ['R4C3', 'R1C2', 'R2C4', 'R3C1'], markers: {}, source: 'reddit-manual', confidence: 0.7 },
  { id: 'rm-r4c3-b', starter: 'R4C3', stanleys: ['R4C3', 'R1C2', 'R2C1', 'R3C4'], markers: {}, source: 'reddit-manual', confidence: 0.7 },

  // ── R4C4 starters ─────────────────────────────────────────────────────────
  { id: 'rm-r4c4-a', starter: 'R4C4', stanleys: ['R4C4', 'R1C2', 'R2C3', 'R3C1'], markers: {}, source: 'reddit-manual', confidence: 0.7 },
];

export const SEED_GRIDS = [
  // ── R1C1 starters (top-left) ─────────────────────────────────────────────
  //
  // Community data (6 sessions, W18–W19) has confirmed for R1C1:
  //   Non-Stanleys (4 sessions each): R3C2, R2C4
  //   Stanley hits: R2C3 (3 sessions W18), R4C2 (1 session W18), R2C2 (1 session W19)
  //   Markers: R1C1=flower → R2C3 is Stanley; R1C1=berry → R2C2 is Stanley
  //
  // Grids marked confidence:0.15 below conflict with confirmed data and will be
  // filtered out at runtime by computeConfirmedMisses, but are kept for completeness.

  // ✓ Confirmed variant W18 (3 sessions) — R2C3 is Stanley, R3C2/R2C4 are NOT
  {
    id: 'confirmed-r1c1-w18-v1',
    starter: 'R1C1',
    stanleys: ['R1C1', 'R2C3', 'R3C1', 'R4C4'],
    markers: { 'R1C1': 'flower', 'R2C3': 'berry' },
    source: 'confirmed',
    confidence: 0.8,
  },
  // ✓ Confirmed variant W18 (1 session) — R4C2 is Stanley, R3C2 is NOT
  {
    id: 'confirmed-r1c1-w18-v2',
    starter: 'R1C1',
    stanleys: ['R1C1', 'R4C2', 'R1C3', 'R3C4'],
    markers: {},
    source: 'confirmed',
    confidence: 0.65,
  },
  // ✓ Confirmed variant W19 (1 session) — R2C2 is Stanley, R2C3/R2C4 are NOT
  {
    id: 'confirmed-r1c1-w19-v1',
    starter: 'R1C1',
    stanleys: ['R1C1', 'R2C2', 'R3C4', 'R4C1'],
    markers: { 'R1C1': 'berry', 'R2C2': 'berry' },
    source: 'confirmed',
    confidence: 0.65,
  },
  // ⚠ Conflicts with confirmed data (R2C4 is confirmed NOT a Stanley for R1C1)
  {
    id: 'seed-r1c1-a',
    starter: 'R1C1',
    stanleys: ['R1C1', 'R2C4', 'R3C1', 'R4C2'],
    markers: {},
    source: 'seed',
    confidence: 0.15,
  },
  {
    id: 'seed-r1c1-b',
    starter: 'R1C1',
    stanleys: ['R1C1', 'R2C2', 'R3C1', 'R3C4'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r1c1-c',
    starter: 'R1C1',
    stanleys: ['R1C1', 'R1C4', 'R3C1', 'R4C1'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  // ⚠ R3C2 is confirmed NOT a Stanley for R1C1
  {
    id: 'seed-r1c1-d',
    starter: 'R1C1',
    stanleys: ['R1C1', 'R2C3', 'R3C2', 'R4C4'],
    markers: {},
    source: 'seed',
    confidence: 0.15,
  },
  // ⚠ R2C4 is confirmed NOT a Stanley for R1C1
  {
    id: 'seed-r1c1-e',
    starter: 'R1C1',
    stanleys: ['R1C1', 'R1C3', 'R2C4', 'R4C1'],
    markers: {},
    source: 'seed',
    confidence: 0.15,
  },

  // ── R1C4 starters (top-right) ─────────────────────────────────────────────
  {
    id: 'seed-r1c4-a',
    starter: 'R1C4',
    stanleys: ['R1C4', 'R2C1', 'R3C3', 'R4C2'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r1c4-b',
    starter: 'R1C4',
    stanleys: ['R1C4', 'R1C2', 'R3C4', 'R4C1'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r1c4-c',
    starter: 'R1C4',
    stanleys: ['R1C4', 'R2C2', 'R3C1', 'R4C3'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },

  // ── R4C1 starters (bottom-left) ───────────────────────────────────────────
  {
    id: 'seed-r4c1-a',
    starter: 'R4C1',
    stanleys: ['R4C1', 'R1C2', 'R2C4', 'R3C3'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r4c1-b',
    starter: 'R4C1',
    stanleys: ['R4C1', 'R1C4', 'R3C2', 'R4C3'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r4c1-c',
    starter: 'R4C1',
    stanleys: ['R4C1', 'R2C1', 'R2C4', 'R1C3'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },

  // ── R4C4 starters (bottom-right) ──────────────────────────────────────────
  {
    id: 'seed-r4c4-a',
    starter: 'R4C4',
    stanleys: ['R4C4', 'R1C1', 'R2C3', 'R3C2'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r4c4-b',
    starter: 'R4C4',
    stanleys: ['R4C4', 'R1C3', 'R2C1', 'R4C2'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },

  // ── Inner starters ────────────────────────────────────────────────────────
  {
    id: 'seed-r2c2-a',
    starter: 'R2C2',
    stanleys: ['R2C2', 'R1C4', 'R3C1', 'R4C3'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r2c3-a',
    starter: 'R2C3',
    stanleys: ['R2C3', 'R1C1', 'R3C4', 'R4C2'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r3c2-a',
    starter: 'R3C2',
    stanleys: ['R3C2', 'R1C3', 'R2C4', 'R4C1'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r3c3-a',
    starter: 'R3C3',
    stanleys: ['R3C3', 'R1C2', 'R2C4', 'R4C1'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },

  // ── Edge/other starters ───────────────────────────────────────────────────
  {
    id: 'seed-r1c2-a',
    starter: 'R1C2',
    stanleys: ['R1C2', 'R2C4', 'R3C1', 'R4C3'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r1c3-a',
    starter: 'R1C3',
    stanleys: ['R1C3', 'R2C1', 'R3C4', 'R4C2'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r2c1-a',
    starter: 'R2C1',
    stanleys: ['R2C1', 'R1C4', 'R3C3', 'R4C2'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r2c4-a',
    starter: 'R2C4',
    stanleys: ['R2C4', 'R1C1', 'R3C2', 'R4C3'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r3c1-a',
    starter: 'R3C1',
    stanleys: ['R3C1', 'R1C3', 'R2C4', 'R4C2'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r3c4-a',
    starter: 'R3C4',
    stanleys: ['R3C4', 'R1C2', 'R2C1', 'R4C3'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r4c2-a',
    starter: 'R4C2',
    stanleys: ['R4C2', 'R1C4', 'R2C1', 'R3C3'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r4c3-a',
    starter: 'R4C3',
    stanleys: ['R4C3', 'R1C1', 'R2C4', 'R3C2'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },

  ...COMMUNITY_GRIDS,
];
