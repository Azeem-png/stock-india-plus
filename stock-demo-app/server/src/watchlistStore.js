import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../data');
const watchlistFile = path.join(dataDir, 'watchlist.json');

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(watchlistFile, 'utf8');
  } catch {
    await writeFile(watchlistFile, JSON.stringify({ symbols: [], users: {} }, null, 2), 'utf8');
  }
}

function normalizeSymbol(symbol) {
  return String(symbol || '').trim().toUpperCase();
}

function normalizeUserName(name) {
  const collapsed = String(name || '')
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N} _.-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!collapsed) return '';
  return collapsed.slice(0, 40);
}

function buildUserKey(name) {
  return normalizeUserName(name).toLowerCase();
}

function dedupeSymbols(symbols) {
  return [...new Set((symbols || []).map(normalizeSymbol).filter(Boolean))];
}

function sanitizeUserMap(users) {
  if (!users || typeof users !== 'object' || Array.isArray(users)) return {};

  return Object.entries(users).reduce((acc, [rawKey, value]) => {
    const preferredName = typeof value === 'object' && value && !Array.isArray(value) ? value.name : rawKey;
    const userName = normalizeUserName(preferredName || rawKey);
    const key = buildUserKey(rawKey);
    const symbols = dedupeSymbols(Array.isArray(value) ? value : value?.symbols);

    if (!key || !userName) return acc;
    acc[key] = { name: userName, symbols };
    return acc;
  }, {});
}

async function readStore() {
  await ensureStore();

  try {
    const raw = await readFile(watchlistFile, 'utf8');
    const parsed = JSON.parse(raw);
    const symbols = dedupeSymbols(parsed?.symbols);
    const users = sanitizeUserMap(parsed?.users);
    return { symbols, users };
  } catch {
    const fallback = { symbols: [], users: {} };
    await writeStore(fallback);
    return fallback;
  }
}

async function writeStore(store) {
  await ensureStore();

  const nextStore = {
    symbols: dedupeSymbols(store?.symbols),
    users: sanitizeUserMap(store?.users)
  };

  await writeFile(watchlistFile, JSON.stringify(nextStore, null, 2), 'utf8');
  return nextStore;
}

async function readWatchlistSymbols(userName) {
  const store = await readStore();
  const key = buildUserKey(userName);

  if (!key) return store.symbols;
  return dedupeSymbols(store.users[key]?.symbols || []);
}

async function writeWatchlistSymbols(symbols, userName) {
  const store = await readStore();
  const normalizedSymbols = dedupeSymbols(symbols);
  const key = buildUserKey(userName);

  if (!key) {
    const nextStore = await writeStore({ ...store, symbols: normalizedSymbols });
    return nextStore.symbols;
  }

  const normalizedName = normalizeUserName(userName);
  const nextStore = await writeStore({
    ...store,
    users: {
      ...store.users,
      [key]: { name: normalizedName, symbols: normalizedSymbols }
    }
  });

  return nextStore.users[key]?.symbols || [];
}

async function addWatchlistSymbol(symbol, userName) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) throw new Error('Symbol is required');

  const current = await readWatchlistSymbols(userName);
  if (current.includes(normalized)) return current;

  return writeWatchlistSymbols([...current, normalized], userName);
}

async function removeWatchlistSymbol(symbol, userName) {
  const normalized = normalizeSymbol(symbol);
  const current = await readWatchlistSymbols(userName);
  return writeWatchlistSymbols(current.filter(item => item !== normalized), userName);
}

function buildSession(name) {
  const normalizedName = normalizeUserName(name);
  return {
    user: normalizedName,
    normalizedUser: normalizedName,
    userKey: buildUserKey(normalizedName),
    isValid: Boolean(normalizedName)
  };
}

export {
  addWatchlistSymbol,
  buildSession,
  normalizeSymbol,
  normalizeUserName,
  readStore,
  readWatchlistSymbols,
  removeWatchlistSymbol,
  writeStore,
  writeWatchlistSymbols
};
