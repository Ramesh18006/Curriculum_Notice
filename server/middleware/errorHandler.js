/**
 * Global error-handling middleware.
 * Must be registered LAST with `app.use(errorHandler)`.
 */
function errorHandler(err, _req, res, _next) {
    const status = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    if (process.env.NODE_ENV !== 'production') {
        console.error(`[${status}]`, err.stack || message);
    }

    res.status(status).json({ error: message });
}

module.exports = errorHandler;
