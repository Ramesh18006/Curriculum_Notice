const { Router } = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();
router.use(authenticate);

// ── Get all feedback (staff/admin see all, students see their own) ───
router.get('/', async (req, res, next) => {
    try {
        if (req.user.role === 'admin' || req.user.role === 'staff') {
            const [rows] = await db.query(
                `SELECT f.*, u.name AS author_name, u.role AS author_role, u.department
                 FROM feedback f JOIN users u ON f.user_id = u.id
                 ORDER BY f.created_at DESC`
            );
            return res.json(rows);
        }
        // Students see their own feedback
        const [rows] = await db.query(
            `SELECT f.*, u.name AS author_name, u.role AS author_role
             FROM feedback f JOIN users u ON f.user_id = u.id
             WHERE f.user_id = ?
             ORDER BY f.created_at DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// ── Post feedback (any user, typically students) ─────────
router.post('/', async (req, res, next) => {
    try {
        const { message, category } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }
        await db.query(
            'INSERT INTO feedback (user_id, message, category) VALUES (?, ?, ?)',
            [req.user.id, message.trim(), category || 'general']
        );
        res.status(201).json({ success: true });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
