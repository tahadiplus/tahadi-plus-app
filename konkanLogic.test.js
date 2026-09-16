const assert = require('node:assert/strict');
const test = require('node:test');
const konkan = require('./konkanLogic');

const cup = { id: 99, number: 9, color: 'red' };
const tile = (id, number, color) => ({ id, number, color });

test('deals fourteen tiles from the 106-tile deck and removes the cup', () => {
  const board = konkan.startKonkan(() => 0.32);
  assert.equal(board.hand.length, 14);
  assert.equal(board.stock.length, 91);
  assert.equal(board.phase, 'draw');
  assert.equal(board.hand.length + board.stock.length + 1, 106);
});
test('joker is cup minus one with 1 wrapping to 13', () => {
  assert.deepEqual(konkan.jokerFor(cup), { color: 'red', number: 8 });
  assert.deepEqual(konkan.jokerFor({ number: 1, color: 'blue' }), { color: 'blue', number: 13 });
});
test('validates same-number unique-color groups and 3-to-5 runs', () => {
  assert.equal(konkan.validMeld([tile(1, 9, 'blue'), tile(2, 9, 'red'), tile(3, 9, 'black')], cup), true);
  assert.equal(konkan.validMeld([tile(1, 9, 'blue'), tile(2, 9, 'blue'), tile(3, 9, 'black')], cup), false);
  assert.equal(konkan.validMeld([tile(1, 4, 'blue'), tile(2, 5, 'blue'), tile(3, 6, 'blue'), tile(4, 7, 'blue'), tile(5, 8, 'blue')], cup), true);
  assert.equal(konkan.validMeld([tile(1, 12, 'blue'), tile(2, 13, 'blue'), tile(3, 1, 'blue')], cup), true);
  assert.equal(konkan.validMeld([tile(1, 11, 'blue'), tile(2, 12, 'blue'), tile(3, 13, 'blue'), tile(4, 1, 'blue')], cup), true);
  assert.equal(konkan.validMeld([tile(1, 13, 'blue'), tile(2, 1, 'blue'), tile(3, 2, 'blue')], cup), false);
});
test('scores the Erbil opening example as 81', () => {
  const groups = [
    [tile(1, 9, 'red'), tile(2, 9, 'black'), tile(3, 9, 'yellow')],
    [tile(4, 10, 'blue'), tile(5, 11, 'blue'), tile(6, 12, 'blue')],
    [tile(7, 7, 'black'), tile(8, 8, 'black'), tile(9, 9, 'black')],
  ];
  assert.equal(groups.reduce((sum, group) => sum + konkan.meldPoints(group, cup), 0), 81);
});
test('real joker is wild and antique is the fixed cup-minus-one tile', () => {
  assert.equal(konkan.validMeld([tile(1, 7, 'red'), tile(2, 8, 'red'), tile(3, 9, 'red')], cup), true);
  assert.equal(konkan.meldPoints([tile(1, 7, 'red'), tile(2, 8, 'red'), tile(3, 9, 'red')], cup), 24);
  assert.equal(konkan.validMeld([tile(1, 7, 'red'), tile(2, 0, 'false'), tile(3, 9, 'red')], cup), true);
  assert.equal(konkan.validMeld([tile(1, 9, 'blue'), tile(2, 8, 'red'), tile(3, 9, 'black')], cup), true);
  assert.equal(konkan.validMeld([tile(1, 9, 'blue'), tile(2, 0, 'false'), tile(3, 9, 'black')], cup), false);
});
test('two wild jokers cannot make a three-tile meld and a wildcard does not bridge 13-1-2', () => {
  assert.equal(konkan.validMeld([tile(1, 7, 'blue'), tile(2, 8, 'red'), tile(3, 8, 'red')], cup), false);
  assert.equal(konkan.validMeld([tile(1, 13, 'blue'), tile(2, 1, 'blue'), tile(3, 2, 'blue'), tile(4, 8, 'red')], cup), false);
});
test('ambiguous joker position scores conservatively', () => {
  assert.equal(konkan.meldPoints([tile(1, 6, 'blue'), tile(2, 7, 'blue'), tile(3, 8, 'red')], cup), 18);
});
