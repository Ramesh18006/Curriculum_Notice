# CircularHub — Digital Circular & Notice Management Platform

A college-level platform for publishing, viewing, and tracking circulars and notices.  
Built with **Vite** (vanilla JS frontend) and **Express + MySQL** (backend API).

---

## Quick Start

### 1. Prerequisites
- **Node.js** ≥ 18
- **MySQL** ≥ 8 (running locally)

### 2. Database Setup
```bash
mysql -u root -p < database.sql
```

### 3. Configure Env
```bash
cp .env.example .env
# Edit .env with your MySQL credentials and a JWT secret
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Seed Sample Data
```bash
npm run seed
```

### 6. Run (both server + client)
```bash
npm run dev
```

- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:3001

---

## Test Credentials (after seeding)

| Role    | Email              | Password   |
| ------- | ------------------ | ---------- |
| Admin   | admin@college.edu  | admin123   |
| Student | john@student.edu   | user123    |
| Student | jane@student.edu   | user123    |
| Staff   | alan@staff.edu     | staff123   |

---

## Project Structure
```
circularhub/
├── package.json           # Unified deps + scripts
├── vite.config.js         # Frontend dev server + API proxy
├── .env                   # Secrets (git-ignored)
├── .env.example           # Env template
├── database.sql           # MySQL schema
├── index.html             # Vite entry
│
├── src/                   # Frontend (vanilla JS + Vite)
│   ├── main.js            # Entry point + route table
│   ├── api.js             # Centralized fetch + JWT
│   ├── state.js           # Session management
│   ├── router.js          # Hash-based router
│   ├── utils.js           # Escaping, toast, helpers
│   ├── style.css          # Design system
│   └── pages/
│       ├── login.js
│       ├── signup.js
│       ├── dashboard.js
│       └── create.js
│
├── server/                # Express API
│   ├── index.js           # App entry point
│   ├── seed.js            # Database seeder (bcrypt)
│   ├── config/
│   │   └── db.js          # MySQL pool (reads .env)
│   ├── middleware/
│   │   ├── auth.js        # JWT authenticate + authorize
│   │   ├── errorHandler.js
│   │   └── validate.js    # Input validation helpers
│   └── routes/
│       ├── auth.js        # POST /api/auth/login, /register
│       ├── circulars.js   # CRUD + read tracking
│       ├── bus.js         # GET /api/bus
│       └── users.js       # GET /api/users/me, /reads
│
└── public/                # Static assets
    └── vite.svg
```

---

## API Endpoints

### Auth (Public)
| Method | Path               | Description      |
| ------ | ------------------ | ---------------- |
| POST   | /api/auth/login    | Sign in → JWT    |
| POST   | /api/auth/register | Create account   |

### Circulars (JWT Required)
| Method | Path                          | Description          |
| ------ | ----------------------------- | -------------------- |
| GET    | /api/circulars                | List (filtered)      |
| POST   | /api/circulars                | Create (admin only)  |
| POST   | /api/circulars/:id/read       | Mark as read         |
| GET    | /api/circulars/:id/analytics  | Read count (admin)   |

### Users (JWT Required)
| Method | Path            | Description       |
| ------ | --------------- | ----------------- |
| GET    | /api/users/me   | Current profile   |
| GET    | /api/users/reads| User's read list  |

### Bus (Public)
| Method | Path      | Description   |
| ------ | --------- | ------------- |
| GET    | /api/bus  | All schedules |
