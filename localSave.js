const SAVE_KEY = 'tahadi-plus:local-save:v1';
const DEFAULT_INVENTORY = { rose: 0, crown: 0, trophy: 0, eagle: 0, zagros: 0 };

function nonNegativeInt(value, fallback) {
  return Number.isSafeInteger(value) && value >= 0 ? value : fallback;
}

function cleanRooms(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).filter(room => room && typeof room.id === 'string' &&
    typeof room.title === 'string' && typeof room.mode === 'string' &&
    typeof room.host === 'string' && !room.preview).map(room => ({
    id: room.id.slice(0, 40), title: room.title.slice(0, 36),
    mode: room.mode.slice(0, 12), host: room.host.slice(0, 24),
  }));
}

function cleanBoard(value, kind) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.hand) ||
    !Array.isArray(value.stock) || !value[kind] ||
    !['draw', 'discard', 'meld', 'done'].includes(value.phase) ||
    value.hand.length > 106 || value.stock.length > 106) return null;
  const tiles = [...value.hand, ...value.stock];
  if (!tiles.every(tile => tile && Number.isInteger(tile.id) && tile.id >= 0 && tile.id < 106 &&
    Number.isInteger(tile.number) && tile.number >= 0 && tile.number <= 13 &&
    ['red', 'blue', 'black', 'yellow', 'false'].includes(tile.color))) return null;
  if (new Set(tiles.map(tile => tile.id)).size !== tiles.length) return null;
  return value;
}

function restoreSave(raw) {
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!data || data.version !== 1) return null;
    const inventory = {};
    for (const key of Object.keys(DEFAULT_INVENTORY))
      inventory[key] = nonNegativeInt(data.inventory?.[key], 0);
    return {
      name: typeof data.name === 'string' ? data.name.slice(0, 24) : 'یاریزان',
      coins: nonNegativeInt(data.coins, 130),
      wins: nonNegativeInt(data.wins, 0),
      rooms: cleanRooms(data.rooms),
      inventory,
      board: cleanBoard(data.board, 'indicator'),
      konkanBoard: cleanBoard(data.konkanBoard, 'cup'),
    };
  } catch { return null; }
}

function packSave({ name, coins, wins, rooms, inventory, board, konkanBoard }) {
  return JSON.stringify({ version: 1, name, coins, wins, rooms, inventory, board, konkanBoard });
}

module.exports = { SAVE_KEY, restoreSave, packSave };
