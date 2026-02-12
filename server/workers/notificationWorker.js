let cron;
try {
    cron = require('node-cron');
} catch (e) {
    console.warn('⚠️ node-cron module not found. Notification worker will be disabled.');
}
const db = require('../config/db');
const { sendNotification } = require('../config/email');

/**
 * Worker to check for missed circulars and send follow-up notifications.
 */
function startNotificationWorker() {
    if (!cron) return;
    // Run every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        console.log('--- Running Notification Worker ---');
        try {
            // 1. Find pending notifications that haven't been seen and are due for retry
            const [pending] = await db.query(`
        SELECT n.*, u.email, c.title, c.content
        FROM notification_queue n
        JOIN users u ON n.user_id = u.id
        JOIN circulars c ON n.circular_id = c.id
        WHERE n.status != 'seen' 
          AND (n.sent_count = 0 OR (n.sent_count = 1 AND n.next_retry_at <= NOW()))
      `);

            for (const item of pending) {
                // Add a check for sendNotification availability, assuming it might be null/undefined if transporter isn't set up
                if (!sendNotification) {
                    console.warn(`✉️ Skipping notification for user ${item.user_id} (sendNotification function not available)`);
                    continue;
                }
                const success = await sendNotification(item.email, item.title, item.content);

                if (success) {
                    const newSentCount = item.sent_count + 1;
                    const status = newSentCount >= 2 ? 'sent' : 'pending'; // Max 2 emails
                    const nextRetry = newSentCount === 1 ? new Date(Date.now() + 60 * 60 * 1000) : null; // 1 hour later

                    await db.query(
                        'UPDATE notification_queue SET status = ?, sent_count = ?, last_sent_at = NOW(), next_retry_at = ? WHERE id = ?',
                        [status, newSentCount, nextRetry, item.id]
                    );
                }
            }
        } catch (err) {
            console.error('Notification worker error:', err);
        }
    });
}

module.exports = startNotificationWorker;
