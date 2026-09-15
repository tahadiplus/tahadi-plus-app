const COLORS = ['red', 'blue', 'black', 'yellow'];

function makeTiles() {
  const tiles = [];
  let id = 0;
  for (const color of COLORS) {
    for (let number = 1; number <= 13; number++) {
      for (let copy = 0; copy < 2; copy++) tiles.push({ id: id++, color, number });
    }
  }
  tiles.push({ id: id++, color: 'false', number: 0 });
  tiles.push({ id: id++, color: 'false', number: 0 });
  return tiles;
}

function shuffle(tiles, random = Math.random) {
  const copy = [...tiles];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startOkey(random = Math.random) {
  const deck = shuffle(makeTiles(), random);
  // Keep the two false jokers in the stock: only a numbered tile can indicate.
  const indicatorIndex = deck.findIndex(tile => tile.color !== 'false');
  const [indicator] = deck.splice(indicatorIndex, 1);
  return {
    hand: deck.splice(0, 14),
    stock: deck,
    discard: null,
    indicator,
    phase: 'draw',
    turns: 0,
    won: false,
  };
}

function jokerFor(indicator) {
  return { color: indicator.color, number: indicator.number === 13 ? 1 : indicator.number + 1 };
}

function isJoker(tile, indicator) {
  const joker = jokerFor(indicator);
  return tile.color === joker.color && tile.number === joker.number;
}

function effective(tile, indicator) {
  return tile.color === 'false' ? jokerFor(indicator) : tile;
}

function validGroup(group, indicator) {
  if (group.length < 3 || group.length > 4) return false;
  const wild = group.filter(tile => isJoker(tile, indicator)).length;
  const normal = group.filter(tile => !isJoker(tile, indicator)).map(tile => effective(tile, indicator));
  if (!normal.length) return false;
  const sameNumber = normal.every(tile => tile.number === normal[0].number);
  const differentColors = new Set(normal.map(tile => tile.color)).size === normal.length;
  if (sameNumber && differentColors && normal.length + wild <= 4) return true;
  if (!normal.every(tile => tile.color === normal[0].color)) return false;
  // 1-2-3 and 12-13-1 are both legal; 13-1-2 is not.
  for (let start = 1; start <= 13; start++) {
    const values = Array.from({ length: group.length }, (_, i) => ((start + i - 1) % 13) + 1);
    if (start + group.length - 1 > 14) continue;
    if (normal.every(tile => values.includes(tile.number)) && new Set(normal.map(tile => tile.number)).size === normal.length) return true;
  }
  return false;
}

function sevenPairs(hand, indicator) {
  if (hand.length !== 14) return false;
  const used = new Set();
  function seek() {
    if (used.size === 14) return true;
    const first = hand.findIndex((_, i) => !used.has(i));
    used.add(first);
    for (let i = first + 1; i < 14; i++) {
      if (used.has(i)) continue;
      const a = effective(hand[first], indicator);
      const b = effective(hand[i], indicator);
      if (isJoker(hand[first], indicator) || isJoker(hand[i], indicator) || (a.color === b.color && a.number === b.number)) {
        used.add(i);
        if (seek()) return true;
        used.delete(i);
      }
    }
    used.delete(first);
    return false;
  }
  return seek();
}

function winningHand(hand, indicator) {
  if (hand.length !== 14) return false;
  if (sevenPairs(hand, indicator)) return true;
  const memo = new Map();
  function seek(mask) {
    if (mask === (1 << 14) - 1) return true;
    if (memo.has(mask)) return memo.get(mask);
    const first = Array.from({ length: 14 }, (_, i) => i).find(i => !(mask & (1 << i)));
    const others = Array.from({ length: 14 }, (_, i) => i).filter(i => i > first && !(mask & (1 << i)));
    for (let size = 3; size <= 4; size++) {
      function choose(at, chosen) {
        if (chosen.length === size - 1) {
          const indices = [first, ...chosen];
          const group = indices.map(i => hand[i]);
          if (!validGroup(group, indicator)) return false;
          return seek(indices.reduce((value, i) => value | (1 << i), mask));
        }
        for (let j = at; j < others.length; j++) if (choose(j + 1, [...chosen, others[j]])) return true;
        return false;
      }
      if (choose(0, [])) { memo.set(mask, true); return true; }
    }
    memo.set(mask, false);
    return false;
  }
  return seek(0);
}

module.exports = { makeTiles, shuffle, startOkey, jokerFor, isJoker, winningHand, validGroup };
