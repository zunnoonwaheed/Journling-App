const db = require('./../db');
const { syncEntryToRestDb } = require('../services/restdbService');

// Get a specific entry for a logged-in user
exports.getEntry = async (req, res) => {
  const { entryId } = req.params;
  // Get userId from authenticated user instead of params for security
  const userId = req.user?.userId || req.params.userId;

  try {
    const stmt = db.prepare(
      'SELECT id, user_id, transcript, created_at, updated_at, duration_ms, local_path, transcript_id, journal_date, drive_sync_enabled, sync_status, last_sync_error FROM entries WHERE id = ? AND user_id = ?'
    );
    const entry = stmt.get(entryId, userId);

    if (!entry) {
      return res.status(404).json({
        status: 'fail',
        message: 'Entry not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        entry,
      },
    });
  } catch (err) {
    console.error('Get entry error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Get all entries for a user
exports.getAllEntries = async (req, res) => {
  // Get userId from authenticated user instead of params
  const userId = req.user?.userId || req.params.userId;

  try {
    // Check if journal_date column exists
    let stmt;
    try {
      stmt = db.prepare(
        'SELECT id, user_id, transcript, created_at, updated_at, duration_ms, local_path, transcript_id, journal_date, drive_sync_enabled, sync_status, last_sync_error FROM entries WHERE user_id = ? ORDER BY created_at DESC'
      );
      const entries = stmt.all(userId);
      
      res.status(200).json({
        status: 'success',
        results: entries.length,
        data: {
          entries,
        },
      });
    } catch (dbError) {
      // If journal_date column doesn't exist, try without it
      if (dbError.message && (dbError.message.includes('journal_date') || dbError.message.includes('no such column'))) {
        console.log('journal_date column missing in SELECT, using fallback query...');
        // Add the column if it doesn't exist
        try {
          // SQLite doesn't allow functions in DEFAULT when adding columns
          db.exec('ALTER TABLE entries ADD COLUMN journal_date DATE');
          // Update existing rows to use created_at date
          db.exec(`UPDATE entries SET journal_date = date(created_at) WHERE journal_date IS NULL`);
        } catch (alterError) {
          // Column might already exist or other error
          console.log('Could not add column (might already exist):', alterError.message);
        }
        
        // Retry with journal_date
        stmt = db.prepare(
          'SELECT id, user_id, transcript, created_at, updated_at, duration_ms, local_path, transcript_id, journal_date, drive_sync_enabled, sync_status, last_sync_error FROM entries WHERE user_id = ? ORDER BY created_at DESC'
        );
        const entries = stmt.all(userId);
        
        res.status(200).json({
          status: 'success',
          results: entries.length,
          data: {
            entries,
          },
        });
      } else {
        throw dbError;
      }
    }
  } catch (err) {
    console.error('Get all entries error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Update an entry (primarily transcript metadata)
exports.updateEntry = async (req, res) => {
  const { entryId } = req.params;
  const userId = req.user?.userId || req.params.userId;
  const { transcript, journal_date } = req.body;

  try {
    const updateFields = [];
    const updateValues = [];

    if (transcript !== undefined) {
      updateFields.push('transcript = ?');
      updateValues.push(transcript);
    }
    if (journal_date !== undefined) {
      updateFields.push('journal_date = ?');
      updateValues.push(journal_date);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No fields to update',
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(entryId, userId);

    const stmt = db.prepare(
      `UPDATE entries SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`
    );
    const result = stmt.run(...updateValues);

    if (result.changes === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Entry not found',
      });
    }

    // Get updated entry
    const getStmt = db.prepare(
      'SELECT id, user_id, transcript, created_at, updated_at, duration_ms, local_path, transcript_id, journal_date, drive_sync_enabled, sync_status, last_sync_error FROM entries WHERE id = ? AND user_id = ?'
    );
    const entry = getStmt.get(entryId, userId);

    // If sync is enabled, trigger a re-sync
    if (entry.drive_sync_enabled) {
      syncEntryToRestDb(entry, userId).catch((err) => {
        console.error('Error syncing updated entry:', err.message);
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        entry,
      },
    });
  } catch (err) {
    console.error('Update entry error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Deleting entry
exports.deleteEntry = async (req, res) => {
  const { entryId } = req.params;
  // Get userId from authenticated user instead of params for security
  const userId = req.user?.userId || req.params.userId;

  try {
    const stmt = db.prepare('DELETE FROM entries WHERE id = ? AND user_id = ?');
    const result = stmt.run(entryId, userId);

    if (result.changes === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Entry not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.error('Delete entry error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Create a new entry
exports.createEntry = async (req, res) => {
  const userId = req.user?.userId || req.params.userId;
  const { transcript, duration_ms, local_path, journal_date } = req.body;

  try {
    const stmt = db.prepare(
      `INSERT INTO entries (user_id, transcript, duration_ms, local_path, journal_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    );

    const journalDate = journal_date || new Date().toISOString().split('T')[0];
    const result = stmt.run(userId, transcript || null, duration_ms || null, local_path || null, journalDate);

    // Get the created entry
    const getStmt = db.prepare(
      'SELECT id, user_id, transcript, created_at, updated_at, duration_ms, local_path, transcript_id, journal_date, drive_sync_enabled, sync_status, last_sync_error FROM entries WHERE id = ?'
    );
    const entry = getStmt.get(result.lastInsertRowid);

    // If sync is enabled for this user/date, trigger sync
    if (entry.drive_sync_enabled) {
      syncEntryToRestDb(entry, userId).catch((err) => {
        console.error('Error syncing new entry:', err.message);
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        entry,
      },
    });
  } catch (err) {
    console.error('Create entry error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Get entries by date
exports.getEntriesByDate = async (req, res) => {
  const { userId, date } = req.params;

  try {
    // Expect date as YYYY-MM-DD, filter by journal_date
    const stmt = db.prepare(
      `SELECT id, user_id, transcript, created_at, updated_at, duration_ms, local_path, transcript_id, journal_date, drive_sync_enabled, sync_status, last_sync_error
       FROM entries
       WHERE user_id = ? AND journal_date = ?`
    );
    const entries = stmt.all(userId, date);

    res.status(200).json({
      status: 'success',
      data: {
        entries,
      },
    });
  } catch (err) {
    console.error('Get entries by date error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Toggle drive sync for a whole journal_date for the logged-in user
exports.updateDaySyncSettings = async (req, res) => {
  const userId = req.user?.userId || req.params.userId;
  const { date } = req.params;
  const { drive_sync_enabled } = req.body;

  if (typeof drive_sync_enabled === 'undefined') {
    return res.status(400).json({
      status: 'fail',
      message: 'drive_sync_enabled is required',
    });
  }

  try {
    // If disabling sync, also set sync_status to sync_disabled
    if (!drive_sync_enabled) {
      const updateStmt = db.prepare(
        `UPDATE entries
         SET drive_sync_enabled = ?,
             sync_status = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND journal_date = ?`
      );
      updateStmt.run(0, 'sync_disabled', userId, date);
    } else {
      // If enabling sync, set status to pending first, then sync
      const updateStmt = db.prepare(
        `UPDATE entries
         SET drive_sync_enabled = ?,
             sync_status = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND journal_date = ?`
      );
      updateStmt.run(1, 'pending', userId, date);
    }

    // Reload all entries for that date so frontend can refresh
    const getStmt = db.prepare(
      `SELECT id, user_id, transcript, created_at, updated_at, duration_ms, local_path, transcript_id, journal_date, drive_sync_enabled, sync_status, last_sync_error
       FROM entries
       WHERE user_id = ? AND journal_date = ?`
    );
    const entries = getStmt.all(userId, date);

    // Kick off sync for all entries on that date if enabled (async, don't wait)
    if (drive_sync_enabled && entries.length > 0) {
      // Start syncs in background - don't wait for them to complete
      entries.forEach((entry) => {
        syncEntryToRestDb(entry, userId).catch((err) => {
          console.error(
            'Error syncing entry after updateDaySyncSettings:',
            err.message
          );
        });
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        updated: entries.length,
        entries,
      },
    });
  } catch (err) {
    console.error('Update day sync settings error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
