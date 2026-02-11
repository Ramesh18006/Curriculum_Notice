const { Router } = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const { requireFields, requireEnum } = require('../middleware/validate');

const router = Router();

// All circular routes require authentication
router.use(authenticate);

// ── List circulars ───────────────────────────────────────
router.get('/', async (req, res, next) => {
    try {
        const { role, department } = req.user;

        if (role === 'admin') {
            const [rows] = await db.query(
                `SELECT c.*, u.name AS author
         FROM circulars c JOIN users u ON c.created_by = u.id
         ORDER BY c.created_at DESC`
            );
            return res.json(rows);
        }

        // Students & staff see only their dept or 'All'
        const [rows] = await db.query(
            `SELECT c.*, u.name AS author
       FROM circulars c JOIN users u ON c.created_by = u.id
       WHERE c.target_dept = 'All' OR c.target_dept = ?
       ORDER BY c.created_at DESC`,
            [department]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// ── Create circular (admin only) ─────────────────────────
router.post(
    '/',
    authorize('admin'),
    requireFields('title', 'content'),
    requireEnum('priority', ['low', 'medium', 'urgent']),
    async (req, res, next) => {
        try {
            const { title, content, priority, target_dept, target_year } = req.body;
            const [result] = await db.query(
                'INSERT INTO circulars (title, content, priority, target_dept, target_year, created_by) VALUES (?,?,?,?,?,?)',
                [title, content, priority || 'low', target_dept || 'All', target_year || 'All', req.user.id]
            );
            res.status(201).json({ success: true, id: result.insertId });
        } catch (err) {
            next(err);
        }
    }
);

// ── Mark circular as read ────────────────────────────────
router.post('/:id/read', async (req, res, next) => {
    try {
        await db.query(
            'INSERT IGNORE INTO circular_reads (circular_id, user_id) VALUES (?, ?)',
            [req.params.id, req.user.id]
        );
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

// ── Analytics (admin) ────────────────────────────────────
router.get('/:id/analytics', authorize('admin'), async (req, res, next) => {
    try {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS read_count FROM circular_reads WHERE circular_id = ?',
            [req.params.id]
        );
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
