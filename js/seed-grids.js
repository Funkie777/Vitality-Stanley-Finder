// Seed grids: example/community-reported layouts to bootstrap predictions.
// All are marked source:'seed' and confidence:0.5 — they demonstrate the app
// but should be replaced by real crowdsourced data over time.
// Format: stanleys = all 4 Stanley positions including the starter.

export const SEED_GRIDS = [
  // ── R1C1 starters (top-left) ─────────────────────────────────────────────
  // User's confirmed partial: R1C1✓ R3C1✓ R1C3✗ R4C3✗
  {
    id: 'seed-r1c1-a',
    starter: 'R1C1',
    stanleys: ['R1C1', 'R2C4', 'R3C1', 'R4C2'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
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
  {
    id: 'seed-r1c1-d',
    starter: 'R1C1',
    stanleys: ['R1C1', 'R2C3', 'R3C2', 'R4C4'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
  },
  {
    id: 'seed-r1c1-e',
    starter: 'R1C1',
    stanleys: ['R1C1', 'R1C3', 'R2C4', 'R4C1'],
    markers: {},
    source: 'seed',
    confidence: 0.5,
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
];
