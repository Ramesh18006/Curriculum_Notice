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

        console.log('🚀 Database is up to date');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to fix database:', err.message);
        process.exit(1);
    }
}

fix();
