const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'college_circular_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Verify connection once at startup
pool.getConnection((err, conn) => {
    if (err) {
        console.error('✗ MySQL connection failed:', err.message);
        process.exit(1);
    }
    console.log('✓ Connected to MySQL');
    conn.release();
});

module.exports = pool.promise();
