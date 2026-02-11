const { Router } = require('express');
const db = require('../config/db');

const router = Router();

// Bus schedule is public — no auth required
router.get('/', async (_req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM bus_schedule');
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
