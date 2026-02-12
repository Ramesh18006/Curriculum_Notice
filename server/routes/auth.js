const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { requireFields, validateEmail } = require('../middleware/validate');

const router = Router();
const SALT_ROUNDS = 10;

/** Helper to build a JWT from a user row. */
function signToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role, department: user.department, year: user.year },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

// ── Login ────────────────────────────────────────────────
router.post(
    '/login',
    requireFields('email', 'password'),
    validateEmail(),
    async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

            if (!rows.length) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = signToken(user);
            const { password: _, ...safeUser } = user; // strip password from response
            res.json({ token, user: safeUser });
        } catch (err) {
            next(err);
        }
    }
);

// ── Register ─────────────────────────────────────────────
router.post(
    '/register',
    requireFields('name', 'email', 'password'),
    validateEmail(),
    async (req, res, next) => {
        try {
            const { name, email, password, role, department, year } = req.body;
            const hash = await bcrypt.hash(password, SALT_ROUNDS);

            await db.query(
                'INSERT INTO users (name, email, password, role, department, year) VALUES (?,?,?,?,?,?)',
                [name, email, hash, role || 'student', department || null, year || null]
            );

            res.status(201).json({ success: true });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Email already registered' });
            }
            next(err);
        }
    }
);

module.exports = router;
