/**
 * Seed script — inserts sample users, circulars, and bus schedules.
 * Passwords are hashed with bcrypt before insertion.
 *
 * Usage:  npm run seed   (from /server directory)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcrypt');
const db = require('./config/db');

const SALT_ROUNDS = 10;

async function seed() {
    console.log('⏳ Seeding database…');

    // ── Hash passwords ──────────────────────────────────────
    const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    const userHash = await bcrypt.hash('user123', SALT_ROUNDS);
    const staffHash = await bcrypt.hash('staff123', SALT_ROUNDS);

    // ── Clear existing data (in FK-safe order) ──────────────
    await db.query('DELETE FROM google_tokens');
    await db.query('DELETE FROM notification_queue');
    await db.query('DELETE FROM circular_reads');
    await db.query('DELETE FROM circulars');
    await db.query('DELETE FROM events');
    await db.query('DELETE FROM bus_schedule');
    await db.query('DELETE FROM users');

    // ── Reset auto-increment ────────────────────────────────
    await db.query('ALTER TABLE users AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE circulars AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE events AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE bus_schedule AUTO_INCREMENT = 1');

    // ── Users ───────────────────────────────────────────────
    await db.query(
        `INSERT INTO users (name, email, password, role, department, year) VALUES
     ('Admin User',  'admin@college.edu', ?, 'admin',   'Administration', NULL),
     ('John Doe',    'john@student.edu',  ?, 'student', 'CSE', 'III'),
     ('Jane Smith',  'jane@student.edu',  ?, 'student', 'ECE', 'II'),
     ('Prof. Alan',  'alan@staff.edu',    ?, 'staff',   'CSE', NULL)`,
        [adminHash, userHash, userHash, staffHash]
    );

    // ── Circulars ───────────────────────────────────────────
    await db.query(
        `INSERT INTO circulars (title, content, priority, target_dept, target_year, target_role, created_by) VALUES
     ('Holiday Declaration',    'The college will remain closed on Monday due to local elections.', 'medium', 'All', 'All', 'All', 1),
     ('Exam Schedule Released', 'End semester exams start from 15th Nov. Check portal.',            'urgent', 'All', 'All', 'student', 1),
     ('CSE Workshop',           'AI/ML workshop for 3rd year CSE students next Friday.',            'low',    'CSE', 'III', 'student', 1),
     ('ECE Lab Schedule',       'Updated lab schedule for ECE 2nd year students.',                  'medium', 'ECE', 'II',  'student', 1)`
    );

    // ── Bus Schedule ────────────────────────────────────────
    await db.query(
        `INSERT INTO bus_schedule (route_name, departure_time, stops) VALUES
     ('Route A - City Center',  '08:00 AM', 'Main Gate → MG Road → City Center → Railway Station'),
     ('Route B - North Campus', '08:30 AM', 'Main Gate → Tech Park → North Campus → Mall Road'),
     ('Route C - South Side',   '09:00 AM', 'Main Gate → Lake View → South Side → Airport Road'),
     ('Route A - Return',       '04:30 PM', 'Railway Station → City Center → MG Road → Main Gate'),
     ('Route B - Return',       '05:00 PM', 'Mall Road → North Campus → Tech Park → Main Gate')`
    );

    // ── Events ──────────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await db.query(
        `INSERT INTO events (title, type, event_date, description) VALUES
     ('Independence Day', 'holiday', '2026-08-15', 'National Holiday'),
     ('Unit Test-1', 'exam', ?, 'First unit test for all departments'),
     ('Project Submission', 'other', ?, 'Final year project documentation submission')`,
        [today, nextWeek]
    );

    console.log('✓ Database seeded successfully');
    process.exit(0);
}

seed().catch(err => {
    console.error('✗ Seed failed:', err.message);
    process.exit(1);
});
