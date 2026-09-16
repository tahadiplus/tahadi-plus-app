const { makeTiles, shuffle } = require('./gameLogic');

function startKonkan(random = Math.random) {
  const deck = shuffle(makeTiles(), random);
  const cupIndex = deck.findIndex(tile => tile.color !== 'false');
  const [cup] = deck.splice(cupIndex, 1);
  return { cup, hand: deck.splice(0, 14), stock: deck, discard: null,
    phase: 'draw', turns: 0, opened: false, openPoints: 0,
    pending: [], melds: [], won: false };
}

function jokerFor(cup) {
  return { color: cup.color, number: cup.number === 1 ? 13 : cup.number - 1 };
}

function isRealJoker(tile, cup) {
  const joker = jokerFor(cup);
  return tile.color === joker.color && tile.number === joker.number;
}

function points(tile) { return tile.number === 1 || tile.number >= 10 ? 10 : tile.number; }

function analyzeMeld(tiles, cup) {
  if (!cup || tiles.length < 3 || tiles.length > 5) return null;
  const wild = tiles.filter(tile => isRealJoker(tile, cup)).length;
  if (wild >= 2 && tiles.length === 3) return null;
  const normal = tiles.filter(tile => !isRealJoker(tile, cup)).map(tile =>
    tile.color === 'false' ? jokerFor(cup) : tile);
  if (!normal.length) return null;
  const candidates = [];
  if (tiles.length <= 4 && normal.every(tile => tile.number === normal[0].number) &&
    new Set(normal.map(tile => tile.color)).size === normal.length) {
    candidates.push(tiles.length * points(normal[0]));
  }
  if (normal.every(tile => tile.color === normal[0].color) &&
    new Set(normal.map(tile => tile.number)).size === normal.length) {
    const sequences = [];
    for (let start = 1; start <= 14 - tiles.length; start++)
      sequences.push(Array.from({ length: tiles.length }, (_, offset) => start + offset));
    // An ace can close 12-13-1 and longer high-ace runs; it never bridges 13-1-2.
    sequences.push([...Array.from({ length: tiles.length - 1 },
      (_, offset) => 15 - tiles.length + offset), 1]);
    for (const sequence of sequences) {
      if (normal.every(tile => sequence.includes(tile.number)))
        candidates.push(sequence.reduce((sum, number) => sum + points({ number }), 0));
    }
  }
  if (!candidates.length) return null;
  // A selectable rack has no ordered joker slot. Use the lowest legal score
  // where a wildcard could stand in more than one position.
  return { score: Math.min(...candidates) };
}

function validMeld(tiles, cup) { return analyzeMeld(tiles, cup) !== null; }
function meldPoints(tiles, cup) { return analyzeMeld(tiles, cup)?.score ?? 0; }

module.exports = { startKonkan, jokerFor, isRealJoker, points, validMeld, meldPoints };
