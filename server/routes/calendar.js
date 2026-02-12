const { Router } = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

let google;
try {
  google = require('googleapis').google;
} catch (e) {
  console.warn('⚠️ googleapis module not found. Google Calendar features will be disabled.');
}

const router = Router();

const oauth2Client = google ? new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
) : null;

// ── Google OAuth URL ──────────────────────────────────────
router.get('/auth/url', authenticate, (req, res) => {
  if (!oauth2Client) return res.status(503).json({ error: 'Google Calendar integration is not installed on the server.' });
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    state: JSON.stringify({ userId: req.user.id })
  });
  res.json({ url });
});

// ── OAuth Callback ────────────────────────────────────────
router.get('/auth/callback', async (req, res, next) => {
  if (!oauth2Client) return res.status(503).send('Google Calendar integration is not installed.');
  const { code, state } = req.query;
  const { userId } = JSON.parse(state);

  try {
    const { tokens } = await oauth2Client.getToken(code);

    await db.query(
      'INSERT INTO google_tokens (user_id, access_token, refresh_token, expiry_date) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE access_token=?, refresh_token=?, expiry_date=?',
      [userId, tokens.access_token, tokens.refresh_token, tokens.expiry_date, tokens.access_token, tokens.refresh_token, tokens.expiry_date]
    );

    res.send('<script>window.close();</script>'); // Close popup
  } catch (err) {
    next(err);
  }
});

// ── Get Events (Merged) ───────────────────────────────────
router.get('/events', authenticate, async (req, res, next) => {
  try {
    // 1. Fetch from local DB (circulars with event dates + standalone events)
    // Admin sees ALL events; Staff sees their own + targeted; Students see only targeted
    let circularQuery, circularParams;

    if (req.user.role === 'admin') {
      circularQuery = `
        SELECT COALESCE(event_type, 'circular') as type, title,
               DATE_FORMAT(event_date, '%Y-%m-%d') as date, content as description
        FROM circulars WHERE event_date IS NOT NULL`;
      circularParams = [];
    } else if (req.user.role === 'staff') {
      circularQuery = `
        SELECT COALESCE(event_type, 'circular') as type, title,
               DATE_FORMAT(event_date, '%Y-%m-%d') as date, content as description
        FROM circulars WHERE event_date IS NOT NULL
          AND (created_by = ? OR target_role = 'All' OR target_role = 'staff')`;
      circularParams = [req.user.id];
    } else {
      circularQuery = `
        SELECT COALESCE(event_type, 'circular') as type, title,
               DATE_FORMAT(event_date, '%Y-%m-%d') as date, content as description
        FROM circulars WHERE event_date IS NOT NULL
          AND (target_dept = 'All' OR target_dept = ?)
          AND (target_role = 'All' OR target_role = ?)`;
      circularParams = [req.user.department || 'All', req.user.role];
    }

    const [circularEvents] = await db.query(circularQuery, circularParams);
    const [standaloneEvents] = await db.query(
      `SELECT type, title, DATE_FORMAT(event_date, '%Y-%m-%d') as date, description FROM events`
    );
    const dbEvents = [...circularEvents, ...standaloneEvents];

    // 2. Fetch from Google if connected
    let googleEvents = [];
    const [tokenRows] = await db.query('SELECT * FROM google_tokens WHERE user_id = ?', [req.user.id]);

    if (tokenRows.length > 0 && oauth2Client) {
      const tokens = tokenRows[0];
      oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const { data } = await calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      googleEvents = data.items.map(item => ({
        type: 'google',
        title: item.summary,
        date: item.start.dateTime || item.start.date,
        description: item.description || ''
      }));
    }

    res.json([...dbEvents, ...googleEvents]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
