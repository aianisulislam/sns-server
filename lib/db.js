import Database from "better-sqlite3";

const db = new Database("./war.db");

export function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateUniqueId(tableName) {
  let id, exists;
  do {
    id = generateId();
    const stmt = db.prepare(`SELECT 1 FROM ${tableName} WHERE id = ? LIMIT 1`);
    exists = stmt.get(id);
  } while (exists);
  return id;
}

db.exec(`
  -- DROP TABLE IF EXISTS war_rooms;
  -- DROP TABLE IF EXISTS players;

  CREATE TABLE IF NOT EXISTS war_rooms (
    id TEXT PRIMARY KEY,
    player_ids TEXT,   -- JSON array of player_ids
    pit TEXT,          -- JSON array of cards played [{card, player_id}]
    turn TEXT,         -- id of current player in player_ids
    status TEXT,       -- e.g. 'waiting', 'active', 'finished'
    message TEXT       -- optional message for the room
  );

  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    name TEXT,
    online_status TEXT,  -- 'online' | 'offline' | 'disconnected'
    deck TEXT,           -- JSON array of {value, suit}
    hand TEXT,           -- JSON array of {value, suit}
    score INTEGER DEFAULT 0
  );
`);

console.log("Database reset: fresh war_rooms & players tables ready ✅");

export default db;
