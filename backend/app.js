// Load environment variables FIRST, before any other requires
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const entryRouter = require('./routes/entryRoutes');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const transcriptionRouter = require('./routes/transcriptionRoutes');
const transcriptRouter = require('./routes/transcriptRoutes');

app.use(cors());

app.use(express.json());

// Serve audio files
app.use('/api/journal-ease/audio', express.static(path.join(__dirname, 'audio_files')));

// Auth routes (signup/login) - no authentication required
app.use('/api/journal-ease/auth', authRouter);

// Transcription route - no authentication required (or add if needed)
app.use('/api/journal-ease', transcriptionRouter);

// Protected routes - require authentication
app.use('/api/journal-ease', entryRouter);
app.use('/api/journal-ease', userRouter);
app.use('/api/journal-ease', transcriptRouter);


module.exports = app; 

