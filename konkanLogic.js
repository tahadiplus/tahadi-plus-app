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

// Beta practice deliberately avoids wildcards until their positions can be validated.
function validMeld(tiles, cup) {
  if (tiles.length < 3 || tiles.length > 5 || tiles.some(tile =>
    tile.color === 'false' || isRealJoker(tile, cup))) return false;
  if (tiles.length <= 4 && tiles.every(tile => tile.number === tiles[0].number) &&
    new Set(tiles.map(tile => tile.color)).size === tiles.length) return true;
  if (!tiles.every(tile => tile.color === tiles[0].color)) return false;
  const sorted = tiles.map(tile => tile.number).sort((a, b) => a - b);
  if (new Set(sorted).size !== sorted.length) return false;
  if (sorted.every((value, index) => value === sorted[0] + index)) return true;
  // The ace may end a run as 12-13-1, but 13-1-2 must never bridge.
  return tiles.length === 3 && sorted.join(',') === '1,12,13';
}

function meldPoints(tiles) { return tiles.reduce((sum, tile) => sum + points(tile), 0); }

module.exports = { startKonkan, jokerFor, isRealJoker, points, validMeld, meldPoints };
