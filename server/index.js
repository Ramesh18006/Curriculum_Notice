const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Core middleware ──────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Routes ───────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ status: 'CircularHub API running' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/circulars', require('./routes/circulars'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/bus', require('./routes/bus'));
app.use('/api/users', require('./routes/users'));

// ── Error handler (must be last) ─────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────
const startNotificationWorker = require('./workers/notificationWorker');
app.listen(PORT, () => {
    console.log(`✓ Server running → http://localhost:${PORT}`);
    startNotificationWorker();
});
