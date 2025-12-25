const axios = require('axios');
const db = require('../db');

// All credentials stay in environment variables which are NOT committed.
const RESTDB_BASE_URL = process.env.RESTDB_BASE_URL;
const RESTDB_API_KEY = process.env.RESTDB_API_KEY;
// Collection name you will create in restdb.io (can be changed to your actual name)
// Note: restdb.io doesn't allow underscores in collection names
const RESTDB_COLLECTION = process.env.RESTDB_COLLECTION || 'journalentries';

const hasRestDbConfig = () => {
  const hasConfig = Boolean(RESTDB_BASE_URL && RESTDB_API_KEY && RESTDB_COLLECTION);
  if (!hasConfig) {
    console.log('[restdb] Configuration check: Missing env vars');
    console.log('[restdb] RESTDB_BASE_URL:', RESTDB_BASE_URL ? '✓' : '✗');
    console.log('[restdb] RESTDB_API_KEY:', RESTDB_API_KEY ? '✓' : '✗');
    console.log('[restdb] RESTDB_COLLECTION:', RESTDB_COLLECTION || '✗');
  }
  return hasConfig;
};

const restdbClient = axios.create({
  baseURL: RESTDB_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // This API key is injected at runtime from config.env (which is gitignored)
    'x-apikey': RESTDB_API_KEY || '',
  },
  timeout: 10000,
});

/**
 * Map a local entry row to the document format stored in restdb.
 */
function mapEntryToRestDbDoc(entry, userId) {
  return {
    user_id: userId,
    entry_id: entry.id,
    journal_date: entry.journal_date || (entry.created_at || '').split('T')[0],
    transcript: entry.transcript || '',
    // local_path is relative; you can expose it via a public URL if needed
    audio_local_path: entry.local_path || null,
    duration_ms: entry.duration_ms || null,
    created_at: entry.created_at,
    updated_at: entry.updated_at,
  };
}

/**
 * Upsert a single entry into restdb.
 * This is kept simple: we insert a new document each time; you can later
 * switch to a proper upsert using RESTDB _id or unique keys if needed.
 */
async function syncEntryToRestDb(entry, userId) {
  if (!hasRestDbConfig()) {
    // No config → just mark as not synced but do not throw
    const stmt = db.prepare(
      'UPDATE entries SET sync_status = ?, last_sync_error = ? WHERE id = ?'
    );
    stmt.run('sync_disabled', 'RESTDB not configured', entry.id);
    return;
  }

  const updateStatus = db.prepare(
    'UPDATE entries SET sync_status = ?, last_sync_error = ? WHERE id = ?'
  );

  // Immediately mark as pending
  updateStatus.run('pending', null, entry.id);

  try {
    const doc = mapEntryToRestDbDoc(entry, userId);
    console.log(`[restdb] Syncing entry ${entry.id} to collection "${RESTDB_COLLECTION}"`);
    const response = await restdbClient.post(`/rest/${RESTDB_COLLECTION}`, doc);
    console.log(`[restdb] ✓ Entry ${entry.id} synced successfully`);
    updateStatus.run('synced', null, entry.id);
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message;
    console.error(`[restdb] ✗ Sync error for entry ${entry.id}:`, errorMsg);
    if (err.response?.status === 500 && errorMsg.includes('not found')) {
      console.error(`[restdb] Collection "${RESTDB_COLLECTION}" does not exist in restdb.io. Please create it in the dashboard.`);
    }
    updateStatus.run(
      'sync_failed',
      errorMsg,
      entry.id
    );
  }
}

module.exports = {
  syncEntryToRestDb,
};


