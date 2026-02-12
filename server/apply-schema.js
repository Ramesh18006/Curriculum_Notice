const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function applySchema() {
    console.log('⏳ Connecting to MySQL to apply schema…');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        const sqlPath = path.join(__dirname, '..', 'database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📝 Executing database.sql…');
        await connection.query(sql);
        console.log('✅ Schema applied successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to apply schema:', err.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

applySchema();
