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
  assert.equal(konkan.validMeld([tile(1, 13, 'blue'), tile(2, 1, 'blue'), tile(3, 2, 'blue')], cup), false);
});
test('scores the Erbil opening example as 81', () => {
  const groups = [[9, 9, 9], [10, 11, 12], [7, 8, 9]];
  assert.equal(groups.reduce((sum, group) => sum + konkan.meldPoints(group.map((number, id) => tile(id, number, 'blue'))), 0), 81);
});
test('practice explicitly rejects wildcard melds', () => {
  assert.equal(konkan.validMeld([tile(1, 7, 'red'), tile(2, 8, 'red'), tile(3, 9, 'red')], cup), false);
  assert.equal(konkan.validMeld([tile(1, 7, 'red'), tile(2, 0, 'false'), tile(3, 9, 'red')], cup), false);
});
