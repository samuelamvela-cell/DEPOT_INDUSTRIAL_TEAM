import initSqlJs from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let DATA_DIR = process.env.AGROPREDICT_DATA_DIR || path.join(__dirname, 'data');
let DB_FILE = path.join(DATA_DIR, 'agropredict.sqlite');

let db = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'farm_advisor',
  organization TEXT,
  phone TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  currency TEXT NOT NULL DEFAULT 'FCFA',
  surface_unit TEXT NOT NULL DEFAULT 'ha',
  region TEXT NOT NULL DEFAULT 'Lékié',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  surface_ha REAL NOT NULL,
  soil_type TEXT NOT NULL,
  soil_ph REAL NOT NULL,
  slope_percent REAL NOT NULL DEFAULT 3,
  awc_mm REAL NOT NULL DEFAULT 120,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  locality TEXT NOT NULL,
  region TEXT NOT NULL,
  prev_crop TEXT,
  prev_variety TEXT,
  prev_harvest TEXT,
  prev_yield REAL,
  prev_residual_n REAL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS crops (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_fr TEXT NOT NULL DEFAULT '',
  variety TEXT NOT NULL,
  family TEXT NOT NULL,
  cycle_days INTEGER NOT NULL,
  water_need_mm INTEGER NOT NULL,
  water_need_level TEXT NOT NULL,
  nitrogen_fixation REAL NOT NULL,
  yield_potential REAL NOT NULL,
  market_price_fcfa REAL NOT NULL,
  description TEXT NOT NULL,
  description_fr TEXT NOT NULL DEFAULT '',
  stress_tolerance TEXT NOT NULL,
  stress_tolerance_fr TEXT NOT NULL DEFAULT '',
  favorable_seasons TEXT NOT NULL,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS telemetry_cache (
  cache_key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  fetched_at TEXT NOT NULL
);
`;

export async function initDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn(`[db] Warning: Cannot write to ${DATA_DIR} (${err.code || err.message}). Falling back to local data directory.`);
    DATA_DIR = path.join(__dirname, 'data');
    DB_FILE = path.join(DATA_DIR, 'agropredict.sqlite');
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    db = new SQL.Database(new Uint8Array(fs.readFileSync(DB_FILE)));
  } else {
    db = new SQL.Database();
  }
  db.run(SCHEMA);
  migrate();
  persist();
  return db;
}

/** Add columns introduced after the first release (SQLite has no IF NOT EXISTS for columns). */
function migrate() {
  const columns = new Set(
    all('PRAGMA table_info(crops)').map((c) => c.name),
  );
  const additions = [
    ['name_fr', "TEXT NOT NULL DEFAULT ''"],
    ['description_fr', "TEXT NOT NULL DEFAULT ''"],
    ['stress_tolerance_fr', "TEXT NOT NULL DEFAULT ''"],
  ];
  for (const [name, def] of additions) {
    if (!columns.has(name)) db.run(`ALTER TABLE crops ADD COLUMN ${name} ${def}`);
  }
}

export function persist() {
  if (!db) return;
  const bytes = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(bytes));
}

function bind(stmt, params = []) {
  if (params.length) stmt.bind(params);
}

export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  bind(stmt, params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

export function get(sql, params = []) {
  return all(sql, params)[0] || null;
}

export function run(sql, params = []) {
  const stmt = db.prepare(sql);
  bind(stmt, params);
  stmt.step();
  stmt.free();
  persist();
}

export function randomId(prefix = '') {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}${Date.now().toString(36)}${rand}`;
}
