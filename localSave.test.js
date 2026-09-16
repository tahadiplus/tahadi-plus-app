const assert = require('node:assert/strict');
const test = require('node:test');
const { restoreSave, packSave } = require('./localSave');

test('restores the local wallet, profile and user-created rooms', () => {
  const saved = packSave({ name: 'شێخە', coins: 180, wins: 2,
    rooms: [{ id: '1', title: 'ژوورەکەم', mode: '4v4', host: 'شێخە' }],
    inventory: { rose: 1, crown: 0, trophy: 0, eagle: 0, zagros: 2 },
    board: null, konkanBoard: null });
  const result = restoreSave(saved);
  assert.equal(result.name, 'شێخە');
  assert.equal(result.coins, 180);
  assert.equal(result.inventory.zagros, 2);
  assert.equal(result.rooms[0].title, 'ژوورەکەم');
});

test('never restores preview rooms or invalid wallet balances', () => {
  const result = restoreSave({ version: 1, coins: -500, wins: NaN,
    inventory: { rose: -1 }, rooms: [{ id: 'demo', title: 'نمونە', mode: '4v4', host: 'x', preview: true }] });
  assert.equal(result.coins, 130);
  assert.equal(result.wins, 0);
  assert.equal(result.inventory.rose, 0);
  assert.deepEqual(result.rooms, []);
});

test('ignores damaged or incompatible saved data', () => {
  assert.equal(restoreSave('not json'), null);
  assert.equal(restoreSave('{"version":2}'), null);
});
