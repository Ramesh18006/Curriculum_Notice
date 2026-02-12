-- ══════════════════════════════════════════════════════════
-- CircularHub — Database Schema
-- Run this ONCE to create the schema, then use `npm run seed`
-- in the /server directory to populate with sample data.
-- ══════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS college_circular_db;
USE college_circular_db;

-- Drop old tables (FK-safe order)
DROP TABLE IF EXISTS google_tokens;
DROP TABLE IF EXISTS notification_queue;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS circular_reads;
DROP TABLE IF EXISTS circulars;
DROP TABLE IF EXISTS bus_schedule;
DROP TABLE IF EXISTS users;

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(100)  NOT NULL UNIQUE,
    password   VARCHAR(255)  NOT NULL,
    role       ENUM('admin', 'student', 'staff') DEFAULT 'student',
    department VARCHAR(50),
    year       VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Circulars ─────────────────────────────────────────────
CREATE TABLE circulars (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    content     TEXT         NOT NULL,
    priority    ENUM('low', 'medium', 'urgent') DEFAULT 'low',
    target_dept VARCHAR(50)  DEFAULT 'All',
    target_year VARCHAR(10)  DEFAULT 'All',
    target_role ENUM('All', 'staff', 'student') DEFAULT 'All',
    attachment_url VARCHAR(500) DEFAULT NULL,
    event_date    DATE DEFAULT NULL,
    event_type    VARCHAR(30) DEFAULT NULL,
    created_by  INT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ── Read Tracking ─────────────────────────────────────────
CREATE TABLE circular_reads (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    circular_id INT NOT NULL,
    user_id     INT NOT NULL,
    read_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (circular_id) REFERENCES circulars(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
    UNIQUE KEY unique_read (circular_id, user_id)
);

-- ── Bus Schedule ──────────────────────────────────────────
CREATE TABLE bus_schedule (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    route_name     VARCHAR(100) NOT NULL,
    departure_time VARCHAR(20)  NOT NULL,
    stops          TEXT         NOT NULL
);

-- ── Events (Exams, Holidays, etc.) ────────────────────────
CREATE TABLE events (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    type        ENUM('exam', 'holiday', 'other') DEFAULT 'other',
    event_date  DATE NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Notifications & Queue ─────────────────────────────────
CREATE TABLE notification_queue (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    circular_id     INT NOT NULL,
    status          ENUM('pending', 'sent', 'seen') DEFAULT 'pending',
    sent_count      INT DEFAULT 0,
    last_sent_at    TIMESTAMP NULL,
    next_retry_at   TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (circular_id) REFERENCES circulars(id) ON DELETE CASCADE
);

-- ── Google OAuth Tokens ──────────────────────────────────
CREATE TABLE google_tokens (
    user_id       INT PRIMARY KEY,
    access_token  TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expiry_date   BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Comments / Feedback ──────────────────────────────────
CREATE TABLE comments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    circular_id INT NOT NULL,
    user_id     INT NOT NULL,
    message     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (circular_id) REFERENCES circulars(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE
);

-- ── Feedback / Ideas ────────────────────────────────────
CREATE TABLE feedback (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    message     TEXT NOT NULL,
    category    VARCHAR(50) DEFAULT 'general',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ┌──────────────────────────────────────────────────────┐
-- │  Seed data is now handled by the seed.js script.     │
-- │  Run:  cd server && npm run seed                     │
-- └──────────────────────────────────────────────────────┘
