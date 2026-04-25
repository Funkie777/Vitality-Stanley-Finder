// Parse Stanley grid positions from free-form text (Reddit posts, comments).

const POSITION_NAMES = {
  'top-left':    'R1C1', 'top left':    'R1C1', 'topleft':    'R1C1',
  'top-right':   'R1C4', 'top right':   'R1C4', 'topright':   'R1C4',
  'bottom-left': 'R4C1', 'bottom left': 'R4C1', 'bottomleft': 'R4C1',
  'bottom-right':'R4C4', 'bottom right':'R4C4', 'bottomright':'R4C4',
};

// Emojis/chars that represent a Stanley in a visual grid
const STANLEY_TOKENS = ['🦔', '🐾', '🌟', '⭐', '✓', '✅'];
const EMPTY_TOKENS   = ['🌿', '🍃', '🌱', '🌾', '⬜', '□', '▢', '_', '-', '·', '.', '0'];

export function numToPos(n) {
  const i = n - 1;
  return `R${Math.floor(i / 4) + 1}C${(i % 4) + 1}`;
}

export function posToNum(pos) {
  const r = parseInt(pos[1], 10);
  const c = parseInt(pos[3], 10);
  return (r - 1) * 4 + c;
}

export function isValidPos(pos) {
  return /^R[1-4]C[1-4]$/.test(pos);
}

// Extract all position strings from text
export function parsePositions(text) {
  const positions = new Set();

  // RxCy notation (case-insensitive)
  for (const m of text.matchAll(/\bR([1-4])C([1-4])\b/gi)) {
    positions.add(`R${m[1]}C${m[2]}`);
  }

  // "row X col Y" / "row X, col Y"
  for (const m of text.matchAll(/row\s*([1-4])[,\s]+col(?:umn)?\s*([1-4])/gi)) {
    positions.add(`R${m[1]}C${m[2]}`);
  }

  // Named corners
  const lower = text.toLowerCase();
  for (const [name, pos] of Object.entries(POSITION_NAMES)) {
    if (lower.includes(name)) positions.add(pos);
  }

  // Numbers 1-16 appearing with "position" keyword
  for (const m of text.matchAll(/(?:position|pos|tile|square|box)\s*#?\s*([1-9]|1[0-6])\b/gi)) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 16) positions.add(numToPos(n));
  }

  // Coordinate pairs like (1,2) or [3,4]
  for (const m of text.matchAll(/[\[(]([1-4])\s*[,;]\s*([1-4])[\])]/g)) {
    positions.add(`R${m[1]}C${m[2]}`);
  }

  // Try emoji grid parsing
  parseEmojiGrid(text, positions);

  return [...positions].filter(isValidPos);
}

// Try to find a 4×4 character/emoji grid in text lines
function parseEmojiGrid(text, positions) {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  for (let i = 0; i <= lines.length - 4; i++) {
    const chunk = lines.slice(i, i + 4);
    const rows = chunk.map(line =>
      // Split on whitespace; also split on emoji boundaries
      line.split(/\s+/).filter(t => t.length > 0)
    );

    if (!rows.every(r => r.length === 4)) continue;

    let foundAny = false;
    rows.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (STANLEY_TOKENS.some(t => cell.includes(t))) {
          positions.add(`R${ri + 1}C${ci + 1}`);
          foundAny = true;
        }
      });
    });

    if (foundAny) return; // Use first valid grid block found
  }
}

// Attempt to extract one or more complete grids (4 positions) from text.
export function extractGrids(text, source = 'reddit') {
  const positions = parsePositions(text);
  const grids = [];

  if (positions.length === 4) {
    grids.push({
      stanleys: positions,
      markers: {},
      source,
      confidence: 0.55,
    });
    return grids;
  }

  // Look for a stated starter + other positions
  const starterMatch = text.match(
    /(?:starter|free|guaranteed|given|auto)[^\w]*([Rr][1-4][Cc][1-4])/i
  );

  if (starterMatch) {
    const starter = starterMatch[1].toUpperCase();
    const rest = positions.filter(p => p !== starter);
    if (rest.length >= 3) {
      grids.push({
        stanleys: [starter, ...rest.slice(0, 3)],
        markers: {},
        source,
        confidence: 0.5,
        starter,
      });
    }
  }

  return grids;
}

// Normalise a grid object to ensure starter field is set
export function normaliseGrid(grid) {
  const g = { ...grid };
  if (!g.starter && g.stanleys?.length > 0) {
    g.starter = g.stanleys[0];
  }
  if (!g.markers) g.markers = {};
  return g;
}
