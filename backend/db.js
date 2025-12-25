const path = require('path');
const Database = require('better-sqlite3');

// Open (or create) a local SQLite database file
const dbPath = path.join(__dirname, 'journal.db');
const db = new Database(dbPath);

// Improve concurrency a bit
db.pragma('journal_mode = WAL');

// Check if users table exists and has old schema (auth0_id column)
let needsMigration = false;
try {
  const checkSchema = db.prepare("PRAGMA table_info(users)");
  const columns = checkSchema.all();
  const hasAuth0Id = columns.some(col => col.name === 'auth0_id');
  const hasPasswordHash = columns.some(col => col.name === 'password_hash');
  
  // If table has old Auth0 schema, we need to migrate
  if (hasAuth0Id && !hasPasswordHash) {
    needsMigration = true;
  }
} catch (err) {
  // Table doesn't exist yet, no migration needed
  needsMigration = false;
}

// Migrate from old Auth0 schema to new password-based schema
if (needsMigration) {
  console.log('Migrating database schema from Auth0 to password-based auth...');
  
  // Drop old users table (users created with Auth0 can't log in without passwords anyway)
  db.exec('DROP TABLE IF EXISTS users');
  
  // Also drop entries that reference old users
  db.exec('DROP TABLE IF EXISTS entries');
  
  console.log('Old tables dropped. Creating new schema...');
}

// Initialize schema for users and entries (recordings)
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  reset_token TEXT,
  reset_token_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  transcript TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  duration_ms INTEGER,
  local_path TEXT,
  transcript_id INTEGER,
  journal_date DATE DEFAULT (date('now')),
  audio_blob BLOB,
  -- Drive / cloud sync fields
  drive_sync_enabled INTEGER DEFAULT 0,
  sync_status TEXT,
  last_sync_error TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (transcript_id) REFERENCES transcripts(id)
);

CREATE TABLE IF NOT EXISTS transcripts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recording_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  language TEXT,
  confidence REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recording_id) REFERENCES entries(id)
);
`);

// Backwards-compatible migration: ensure new sync columns exist on old DBs
try {
  const columns = db.prepare('PRAGMA table_info(entries)').all();
  const colNames = columns.map(c => c.name);

  if (!colNames.includes('drive_sync_enabled')) {
    db.exec("ALTER TABLE entries ADD COLUMN drive_sync_enabled INTEGER DEFAULT 0");
  }
  if (!colNames.includes('sync_status')) {
    db.exec("ALTER TABLE entries ADD COLUMN sync_status TEXT");
  }
  if (!colNames.includes('last_sync_error')) {
    db.exec("ALTER TABLE entries ADD COLUMN last_sync_error TEXT");
  }
} catch (err) {
  console.warn('Warning: could not ensure sync columns on entries table:', err.message);
}

console.log('Database initialized successfully.');

module.exports = db;


