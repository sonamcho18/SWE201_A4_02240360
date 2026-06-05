/**
 * db/database.js
 * Initialises the SQLite database and creates tables if they do not exist.
 * Uses better-sqlite3 (synchronous API — simple and reliable for this scale).
 *
 * Database file: data/orderupdateapp.db  (auto-created on first run)
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists next to the src folder
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'orderupdateapp.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// ─── Create tables ────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS tokens (
    device_id  TEXT PRIMARY KEY,
    token      TEXT NOT NULL,
    user_id    TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id            TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    item          TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'placed',
    device_id     TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT
  );
`);

console.log(`[DB] SQLite database ready at: ${DB_PATH}`);

module.exports = db;
