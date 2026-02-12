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

        // Students & staff see based on target_dept, target_year, target_role OR if they are the creator
        const [rows] = await db.query(
            `SELECT c.*, u.name AS author
             FROM circulars c LEFT JOIN users u ON c.created_by = u.id
             WHERE (c.target_role = 'All' OR c.target_role = ?)
               AND (c.target_dept = 'All' OR c.target_dept = ?)
               OR c.created_by = ?
             ORDER BY c.created_at DESC`,
            [role, department || 'All', req.user.id]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// ── Create circular (admin & staff) ──────────────────────
const upload = require('../middleware/upload');

router.post(
    '/',
    authorize('admin', 'staff'),
    upload.single('attachment'),
    async (req, res, next) => {
        try {
            let { title, content, priority, target_dept, target_year, target_role } = req.body;

            if (!title || !content) {
                return res.status(400).json({ error: 'Title and content are required' });
            }

            // Staff can only target students
            if (req.user.role === 'staff') {
                target_role = 'student';
            } else {
                target_role = target_role || 'All';
            }

            // Build attachment URL if file was uploaded
            const attachment_url = req.file ? `/uploads/${req.file.filename}` : null;

            const [result] = await db.query(
                'INSERT INTO circulars (title, content, priority, target_dept, target_year, target_role, attachment_url, created_by) VALUES (?,?,?,?,?,?,?,?)',
                [title, content, priority || 'low', target_dept || 'All', target_year || 'All', target_role, attachment_url, req.user.id]
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

// ── Analytics (admin & author) ──────────────────────────
router.get('/:id/analytics', async (req, res, next) => {
    try {
        const [circ] = await db.query('SELECT * FROM circulars WHERE id = ?', [req.params.id]);
        if (!circ.length) return res.status(404).json({ error: 'Circular not found' });

        const circular = circ[0];

        // Authorization: Admin OR the creator (Staff)
        if (req.user.role !== 'admin' && circular.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const [readRows] = await db.query(
            'SELECT COUNT(*) AS read_count FROM circular_reads WHERE circular_id = ?',
            [req.params.id]
        );

        const [totalRows] = await db.query(
            `SELECT COUNT(*) AS total_count FROM users 
             WHERE (? = 'All' OR role = ?)
               AND (? = 'All' OR department = ?)
               AND (? = 'All' OR year = ?)`,
            [circular.target_role, circular.target_role,
            circular.target_dept, circular.target_dept,
            circular.target_year, circular.target_year]
        );

        res.json({
            read_count: readRows[0].read_count || 0,
            total_count: totalRows[0].total_count || 0,
            unread_count: Math.max(0, (totalRows[0].total_count || 0) - (readRows[0].read_count || 0))
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
