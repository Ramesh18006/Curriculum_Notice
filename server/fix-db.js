const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('./config/db');

async function fix() {
    console.log('⏳ Checking database structure…');
    try {
        // Check if target_role exists in circulars
        const [cols] = await db.query('SHOW COLUMNS FROM circulars LIKE "target_role"');
        if (cols.length === 0) {
            console.log('➕ Adding target_role to circulars table…');
            await db.query("ALTER TABLE circulars ADD COLUMN target_role ENUM('All', 'staff', 'student') DEFAULT 'All' AFTER target_year");
            console.log('✅ Added target_role column');
        } else {
            console.log('✔ target_role column already exists');
        }

        // Check if attachment_url exists in circulars
        const [attCols] = await db.query('SHOW COLUMNS FROM circulars LIKE "attachment_url"');
        if (attCols.length === 0) {
            console.log('➕ Adding attachment_url to circulars table…');
            await db.query("ALTER TABLE circulars ADD COLUMN attachment_url VARCHAR(500) DEFAULT NULL AFTER target_role");
            console.log('✅ Added attachment_url column');
        } else {
            console.log('✔ attachment_url column already exists');
        }

        // Check if event_date exists in circulars
        const [evCols] = await db.query('SHOW COLUMNS FROM circulars LIKE "event_date"');
        if (evCols.length === 0) {
            console.log('➕ Adding event_date and event_type to circulars table…');
            await db.query("ALTER TABLE circulars ADD COLUMN event_date DATE DEFAULT NULL AFTER attachment_url");
            await db.query("ALTER TABLE circulars ADD COLUMN event_type VARCHAR(30) DEFAULT NULL AFTER event_date");
            console.log('✅ Added event_date and event_type columns');
        } else {
            console.log('✔ event_date column already exists');
        }

        // Create comments table if it doesn't exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                circular_id INT NOT NULL,
                user_id     INT NOT NULL,
                message     TEXT NOT NULL,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (circular_id) REFERENCES circulars(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE
            )
        `);
        console.log('✔ comments table ready');

        // Create feedback table if it doesn't exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS feedback (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                user_id     INT NOT NULL,
                message     TEXT NOT NULL,
                category    VARCHAR(50) DEFAULT 'general',
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✔ feedback table ready');

        console.log('🚀 Database is up to date');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to fix database:', err.message);
        process.exit(1);
    }
}

fix();
