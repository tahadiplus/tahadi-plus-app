const test = require('node:test');
const assert = require('node:assert/strict');
const game = require('./gameLogic');
const tile = (color, number) => ({ color, number });
const indicator = tile('red', 5);

test('Okey deck has 106 unique physical tiles', () => {
  const deck = game.makeTiles();
  assert.equal(deck.length, 106);
  assert.equal(new Set(deck.map(piece => piece.id)).size, 106);
  assert.equal(deck.filter(piece => piece.color === 'false').length, 2);
});

test('new game retains a numbered indicator even if a false joker shuffles first', () => {
  const board = game.startOkey(() => 0);
  assert.notEqual(board.indicator.color, 'false');
  assert.equal(board.hand.length, 14);
  assert.equal(board.stock.length, 91);
  assert.equal(board.phase, 'draw');
});

test('indicator 13 wraps joker to number 1', () => {
  assert.deepEqual(game.jokerFor(tile('blue', 13)), { color: 'blue', number: 1 });
  assert.equal(game.isJoker(tile('red', 6), indicator), true);
});

test('valid sets, runs and joker substitutions', () => {
  assert.equal(game.validGroup([tile('red', 7), tile('blue', 7), tile('black', 7)], indicator), true);
  assert.equal(game.validGroup([tile('blue', 12), tile('blue', 13), tile('blue', 1)], indicator), true);
  assert.equal(game.validGroup([tile('blue', 13), tile('blue', 1), tile('blue', 2)], indicator), false);
  assert.equal(game.validGroup([tile('red', 9), tile('red', 11), tile('red', 6)], indicator), true);
  assert.equal(game.validGroup([tile('red', 9), tile('red', 9), tile('red', 10)], indicator), false);
});

test('14 tiles can win by seven pairs or four valid groups', () => {
  const pairs = Array.from({ length: 7 }, (_, number) =>
    [tile('blue', number + 1), tile('blue', number + 1)]).flat();
  assert.equal(game.winningHand(pairs, indicator), true);
  const groups = [
    tile('blue', 1), tile('blue', 2), tile('blue', 3),
    tile('red', 7), tile('black', 7), tile('yellow', 7),
    tile('red', 8), tile('red', 9), tile('red', 10), tile('red', 11),
    tile('blue', 9), tile('black', 9), tile('red', 9), tile('yellow', 9),
  ];
  assert.equal(game.winningHand(groups, indicator), true);
  assert.equal(game.winningHand(groups.slice(1), indicator), false);
});
