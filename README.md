# 📢 CircularHub — Digital Circular & Notice Management Platform

> A modern, role-based platform that replaces chaotic WhatsApp groups and physical notice boards with a streamlined digital experience for colleges.

---

## 👥 Team Quantum

| Member | Role |
|--------|------|
| **Ramesh** | Full-Stack Development & Architecture |
| **Sri Vidya** | Frontend Design & UI/UX |
| **Vyomasai** | Backend Logic & Database |

---

## 🔍 Problem Statement

Educational institutions still rely on **WhatsApp groups, physical notice boards, and word-of-mouth** to distribute circulars and notices. This leads to:

- ❌ **Information overload** — Important notices get buried in chat floods
- ❌ **No targeting** — Every message goes to everyone, regardless of relevance
- ❌ **Zero accountability** — No way to know if students actually read a notice
- ❌ **No archival** — Past circulars are impossible to find
- ❌ **Language barriers** — Not all students are comfortable with English-only communication
- ❌ **No offline access** — Students can't save notices for later reference

**There is no single, structured platform where admins can publish, staff can target, and students can consume circulars efficiently.**

---

## 💡 Our Solution & Unique Features

**CircularHub** is a full-stack web application with role-based access for **Admins, Staff, and Students**, offering:

### Core Features
| Feature | Description |
|---------|-------------|
| 🎯 **Targeted Delivery** | Circulars can be sent to specific roles, departments, and year groups — no more irrelevant noise |
| 📊 **Engagement Analytics** | Staff & admins see real-time read rates, unread counts, and per-circular performance breakdowns |
| 📌 **Pinned Urgent Notices** | Urgent circulars are automatically pinned to the top of every student's feed |
| 📎 **File Attachments** | PDFs and images can be attached and viewed inline within the circular detail view |
| 📄 **PDF Export** | Students can export any circular as a professionally formatted PDF for offline access |
| 📅 **Calendar Integration** | Circulars with event dates appear on a color-coded calendar with Google Calendar sync support |
| 🌐 **Multi-Language Support** | Full Tamil (தமிழ்) and Telugu (తెలుగు) translations with instant language switching |
| 💬 **Comments System** | Two-way communication on each circular — students ask, staff clarify |
| 💡 **Feedback Portal** | Students can submit categorized feedback (academics, infrastructure, etc.) visible to staff |
| 🚌 **Bus Schedule** | Built-in bus route and timing information for students |

### What Makes Us Different
1. **Targeted, not broadcast** — Circulars reach only the intended audience
2. **Accountability built-in** — Read tracking tells staff who's informed and who isn't
3. **Zero-framework frontend** — Vanilla JS keeps the app blazing fast with no bloat
4. **Genuinely multilingual** — Not just labels, but full UI translation in regional languages
5. **Offline-ready** — PDF export means students always have access

---

## 🛠️ Tech Stack

| Layer | Technology | Why We Chose It |
|-------|-----------|-----------------|
| **Frontend** | Vanilla JavaScript (ES6 Modules) | Fast, lightweight, no framework overhead |
| **Build Tool** | Vite | Instant HMR, optimized production builds |
| **Styling** | Vanilla CSS with CSS Variables | Full control over dark theme and responsive design |
| **Backend** | Node.js + Express.js | Fast, event-driven, great ecosystem |
| **Database** | MySQL | Reliable relational DB for structured data |
| **Authentication** | JWT (JSON Web Tokens) | Stateless, scalable session management |
| **Password Security** | bcrypt | Industry-standard hashing with salt rounds |
| **File Uploads** | Multer | Handles multipart form data for PDFs and images |
| **Calendar Sync** | Google Calendar API (OAuth 2.0) | Lets students see college events in their personal calendar |
| **Internationalization** | Custom i18n module | Lightweight, no dependency — supports EN, Tamil, Telugu |
| **PDF Export** | Browser Print API | Zero-dependency PDF generation |

---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js** v18+ installed
- **MySQL** 8.0+ installed and running
- **Git** (to clone the repo)

### Step 1 — Clone the Repository
```bash
git clone https://github.com/your-repo/circularhub.git
cd circularhub
```

### Step 2 — Install Dependencies
```bash
npm install
```

### Step 3 — Set Up the Database
1. Open MySQL and create the database:
```sql
CREATE DATABASE circular_hub;
```
2. Import the schema:
```bash
mysql -u root -p circular_hub < database.sql
```

### Step 4 — Configure Environment Variables
Create a `.env` file in the project root:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=circular_hub
JWT_SECRET=your_secret_key_here
PORT=3000

# Optional — for Google Calendar integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback
```

### Step 5 — Run Database Migrations
```bash
node server/fix-db.js
```

### Step 6 — Start the Application
```bash
# Start backend server
npm run server

# In a new terminal, start frontend dev server
npm run dev
```

### Step 7 — Open in Browser
Navigate to `http://localhost:5173` and sign up to get started!

---

## 📁 Project Structure

```
circularhub/
├── server/               # Backend
│   ├── index.js          # Express server entry point
│   ├── middleware/        # JWT auth middleware
│   ├── routes/            # Modular API routes
│   │   ├── auth.js        # Login, signup, token management
│   │   ├── circulars.js   # CRUD for circulars + read tracking
│   │   ├── calendar.js    # Events + Google Calendar sync
│   │   ├── feedback.js    # Student feedback system
│   │   └── bus.js         # Bus schedule routes
│   ├── db.js              # MySQL connection pool
│   └── fix-db.js          # Database migration script
├── src/                   # Frontend
│   ├── main.js            # App entry point
│   ├── router.js          # Hash-based SPA router
│   ├── api.js             # All API calls (fetch wrappers)
│   ├── state.js           # Auth state management
│   ├── utils.js           # Shared utilities (XSS escape, toast, etc.)
│   ├── i18n.js            # Multi-language translation module
│   ├── style.css          # Complete design system
│   └── pages/             # Page components
│       ├── dashboard.js   # Main dashboard with all tabs
│       ├── create.js      # Circular creation form
│       ├── login.js       # Login page
│       └── signup.js      # Registration page
├── database.sql           # Full schema with tables and seed data
├── package.json           # Dependencies and scripts
└── .env                   # Environment variables (not committed)
```

---

## 📚 Learnings & Challenges

### What We Learned
- **Modular architecture pays off** — Splitting routes, pages, and utilities into separate files made it easy for three team members to work in parallel without merge conflicts
- **Vanilla JS is powerful** — We proved you don't need React or Vue for a production-quality SPA. ES6 modules, template literals, and the Fetch API are more than enough
- **i18n is more than translation** — Building multilingual support taught us to think about string externalization from the start, not as an afterthought
- **Security can't be bolted on** — Integrating JWT auth and bcrypt hashing from day one saved us from retrofitting later
- **Real-time feedback loops matter** — Analytics and read tracking transformed circulars from "fire and forget" to an accountable communication tool

### Challenges We Faced
- **MySQL connection pooling** — We initially hit connection limits under load. Switching to a connection pool with proper error handling solved this
- **Role-based query filtering** — Building SQL queries that correctly filter circulars by admin/staff/student visibility required careful conditional logic
- **Google OAuth flow** — Integrating Google Calendar with OAuth2 tokens, refresh handling, and secure storage was the most complex integration
- **Template literal XSS** — Since we use template literals for rendering, we had to carefully escape all user-generated content to prevent XSS attacks
- **i18n across 130+ keys** — Maintaining translation accuracy for Tamil and Telugu across the entire UI required systematic key management

### If We Had More Time
- Push notifications via Service Workers
- Dark/Light theme toggle
- Circular search and filtering
- Email digest for unread circulars
- Mobile app using the same REST API

---

## 📄 License

Built with ❤️ by **Team Quantum** at the Hackathon 2026.

---

*CircularHub — Because every notice deserves to be read.*
