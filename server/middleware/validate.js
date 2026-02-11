/**
 * Lightweight request validation helpers.
 * No external dependencies — keeps the server lean.
 */

/** Ensures `fields` exist and are non-empty strings in `req.body`. */
function requireFields(...fields) {
    return (req, res, next) => {
        const missing = fields.filter(f => {
            const val = req.body[f];
            return val === undefined || val === null || String(val).trim() === '';
        });
        if (missing.length) {
            return res.status(400).json({
                error: `Missing required fields: ${missing.join(', ')}`,
            });
        }
        next();
    };
}

/** Validates that `field` is one of `allowed` values. */
function requireEnum(field, allowed) {
    return (req, res, next) => {
        const val = req.body[field];
        if (val !== undefined && !allowed.includes(val)) {
            return res.status(400).json({
                error: `Invalid value for ${field}. Allowed: ${allowed.join(', ')}`,
            });
        }
        next();
    };
}

/** Basic email format check. */
function validateEmail(field = 'email') {
    return (req, res, next) => {
        const email = req.body[field];
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        next();
    };
}

module.exports = { requireFields, requireEnum, validateEmail };
