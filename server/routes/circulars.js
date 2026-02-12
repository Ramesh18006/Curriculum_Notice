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
                 FROM circulars c LEFT JOIN users u ON c.created_by = u.id
                 ORDER BY c.created_at DESC`
            );
            return res.json(rows);
        }

        // Students & staff see based on target_dept, target_year (if applicable), and target_role
        const [rows] = await db.query(
            `SELECT c.*, u.name AS author
             FROM circulars c LEFT JOIN users u ON c.created_by = u.id
             WHERE (c.target_role = 'All' OR c.target_role = ?)
               AND (c.target_dept = 'All' OR c.target_dept = ?)
             ORDER BY c.created_at DESC`,
            [role, department || 'All']
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// ── Create circular (admin & staff) ──────────────────────
router.post(
    '/',
    authorize('admin', 'staff'),
    requireFields('title', 'content'),
    requireEnum('priority', ['low', 'medium', 'urgent']),
    async (req, res, next) => {
        try {
            let { title, content, priority, target_dept, target_year, target_role } = req.body;

            // Staff can only target students
            if (req.user.role === 'staff') {
                target_role = 'student';
            } else {
                target_role = target_role || 'All';
            }

            const [result] = await db.query(
                'INSERT INTO circulars (title, content, priority, target_dept, target_year, target_role, created_by) VALUES (?,?,?,?,?,?,?)',
                [title, content, priority || 'low', target_dept || 'All', target_year || 'All', target_role, req.user.id]
            );

            const circularId = result.insertId;

            // Enqueue notifications for all matching users
            const [matchingUsers] = await db.query(
                `SELECT id FROM users 
                 WHERE (? = 'All' OR role = ?)
                   AND (? = 'All' OR department = ?)`,
                [target_role, target_role, target_dept || 'All', target_dept || 'All']
            );

            if (matchingUsers.length > 0) {
                const values = matchingUsers.map(u => [u.id, circularId]);
                await db.query(
                    'INSERT INTO notification_queue (user_id, circular_id) VALUES ?',
                    [values]
                );
            }

            res.status(201).json({ success: true, id: circularId });
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

        // Update notification status as seen
        await db.query(
            'UPDATE notification_queue SET status = "seen" WHERE circular_id = ? AND user_id = ?',
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
