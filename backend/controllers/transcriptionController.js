const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const db = require('../db');

// Proxy transcription request to OpenAI Whisper API
exports.transcribeAudio = async (req, res) => {
  try {
    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Audio file is required',
      });
    }

    // Create FormData for OpenAI API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname || 'audio.mp3',
      contentType: req.file.mimetype || 'audio/mpeg',
    });
    formData.append('model', 'whisper-1');

    // Call OpenAI Whisper API
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    // Save audio file permanently FIRST (before transcription, so we keep it even if transcription fails)
    const audioDir = path.join(__dirname, '../audio_files');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueFilename = `audio_${Date.now()}_${Math.round(Math.random() * 1E9)}.mp3`;
    const savedPath = path.join(audioDir, uniqueFilename);
    
    // Move file from temp location to permanent location
    fs.renameSync(req.file.path, savedPath);

    // Return relative path for database storage
    const relativePath = `audio_files/${uniqueFilename}`;

    // Extract language and confidence if available (Whisper API doesn't return these, but we can add them later)
    const transcriptText = response.data.text;
    const language = response.data.language || null;
    const confidence = null; // Whisper API doesn't provide confidence scores

    res.status(200).json({
      status: 'success',
      data: {
        transcript: transcriptText,
        local_path: relativePath,
        file_size: fs.statSync(savedPath).size,
        language: language,
        confidence: confidence,
      },
    });
  } catch (err) {
    // IMPORTANT: Keep the audio file even if transcription fails
    // Only delete if we haven't moved it to permanent storage yet
    let audioSaved = false;
    if (req.file && req.file.path) {
      try {
        // Check if file was already moved to permanent storage
        const audioDir = path.join(__dirname, '../audio_files');
        if (fs.existsSync(audioDir)) {
          // Try to find if we saved it (check by timestamp in filename)
          const files = fs.readdirSync(audioDir);
          const matchingFile = files.find(f => req.file.path.includes(f.split('_')[1]));
          if (matchingFile) {
            audioSaved = true;
          }
        }
        
        // Only delete temp file if it wasn't saved
        if (!audioSaved && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (unlinkErr) {
        console.error('Error handling temp file:', unlinkErr);
      }
    }

    console.error('Transcription error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Transcription failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      audio_saved: audioSaved, // Let frontend know if audio was saved
    });
  }
};

