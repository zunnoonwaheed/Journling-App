const db = require('../db');

// Create a transcript record linked to a recording
exports.createTranscript = async (req, res) => {
  const { recording_id, text, language, confidence } = req.body;

  try {
    if (!recording_id || !text) {
      return res.status(400).json({
        status: 'fail',
        message: 'recording_id and text are required',
      });
    }

    // Verify recording exists
    const recordingStmt = db.prepare('SELECT id FROM entries WHERE id = ?');
    const recording = recordingStmt.get(recording_id);
    
    if (!recording) {
      return res.status(404).json({
        status: 'fail',
        message: 'Recording not found',
      });
    }

    // Insert transcript
    const insertStmt = db.prepare(
      `INSERT INTO transcripts (recording_id, text, language, confidence)
       VALUES (?, ?, ?, ?)`
    );

    const result = insertStmt.run(
      recording_id,
      text,
      language || null,
      confidence || null
    );

    // Update entry to link to this transcript
    const updateStmt = db.prepare(
      'UPDATE entries SET transcript_id = ?, transcript = ? WHERE id = ?'
    );
    updateStmt.run(result.lastInsertRowid, text, recording_id);

    // Get the created transcript
    const getStmt = db.prepare(
      'SELECT id, recording_id, text, language, confidence, created_at FROM transcripts WHERE id = ?'
    );
    const newTranscript = getStmt.get(result.lastInsertRowid);

    res.status(201).json({
      status: 'success',
      data: {
        transcript: newTranscript,
      },
    });
  } catch (error) {
    console.error('Create transcript error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get transcript by recording_id
exports.getTranscriptByRecording = async (req, res) => {
  const { recordingId } = req.params;

  try {
    const stmt = db.prepare(
      'SELECT id, recording_id, text, language, confidence, created_at FROM transcripts WHERE recording_id = ? ORDER BY created_at DESC LIMIT 1'
    );
    const transcript = stmt.get(recordingId);

    if (!transcript) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transcript not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        transcript,
      },
    });
  } catch (error) {
    console.error('Get transcript error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Retry transcription for an existing recording
exports.retryTranscription = async (req, res) => {
  const { recordingId } = req.params;

  try {
    // Get the recording with its audio file path
    const recordingStmt = db.prepare(
      'SELECT id, local_path, user_id FROM entries WHERE id = ?'
    );
    const recording = recordingStmt.get(recordingId);

    if (!recording) {
      return res.status(404).json({
        status: 'fail',
        message: 'Recording not found',
      });
    }

    if (!recording.local_path) {
      return res.status(400).json({
        status: 'fail',
        message: 'Recording has no audio file',
      });
    }

    // Return the audio file path so frontend can retry transcription
    res.status(200).json({
      status: 'success',
      data: {
        recording_id: recording.id,
        local_path: recording.local_path,
        message: 'Use the local_path to retry transcription via /transcribe endpoint',
      },
    });
  } catch (error) {
    console.error('Retry transcription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

