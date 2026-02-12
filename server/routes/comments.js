const { Router } = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = Router();
router.use(authenticate);

// ── Get comments for a circular ──────────────────────────
router.get('/:circularId', async (req, res, next) => {
    try {
        const [rows] = await db.query(
            `SELECT cm.*, u.name AS author_name, u.role AS author_role
             FROM comments cm
             JOIN users u ON cm.user_id = u.id
             WHERE cm.circular_id = ?
             ORDER BY cm.created_at ASC`,
            [req.params.circularId]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// ── Post a comment (any authenticated user) ──────────────
router.post('/:circularId', async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        await db.query(
            'INSERT INTO comments (circular_id, user_id, message) VALUES (?, ?, ?)',
            [req.params.circularId, req.user.id, message.trim()]
        );

        res.status(201).json({ success: true });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
