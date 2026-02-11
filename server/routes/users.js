const { Router } = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = Router();

// All user routes require auth
router.use(authenticate);

// ── Current user profile ─────────────────────────────────
router.get('/me', async (req, res, next) => {
    try {
        const [rows] = await db.query(
            'SELECT id, name, email, role, department, year, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// ── Get circular IDs the current user has read ───────────
router.get('/reads', async (req, res, next) => {
    try {
        const [rows] = await db.query(
            'SELECT circular_id FROM circular_reads WHERE user_id = ?',
            [req.user.id]
        );
        res.json(rows.map(r => r.circular_id));
    } catch (err) {
        next(err);
    }
});

module.exports = router;
