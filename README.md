# ExamVault – Academic Resource Management Platform

> A full-stack web application for managing and sharing academic resources such as exam papers and study notes.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Authentication & Authorization](#authentication--authorization)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [Development Notes](#development-notes)

---

## Overview

ExamVault provides a clean browsing experience for all visitors, with login required only for identity-specific actions (downloads, favorites, comments, and admin operations). The platform includes a student-facing experience and an admin dashboard for content and analytics management.

---

## Features

### 🎓 Student / General User

**Public Browsing** _(no login required)_

- View home page, papers, notes, announcements, and resource details.
- Search and filter papers by subject, year, and exam type (`Mid1`, `Mid2`, `Sem`, `Other`).
- Search and filter notes by subject, year, and unit.

**Authenticated Actions** _(login required)_

- **Download** papers and notes.
- **Favorites** – add/remove papers and notes from your personal favorites.
- **Comments / Discussion** – post comments on resources and participate in discussions.
- **Likes** – like/unlike papers and notes.
- **Profile Management** – view, update, or delete your profile.

**Smart Auth Flow**

- Login is triggered only when a protected action is attempted.
- After successful login, the app automatically resumes the original intended action (e.g., continues a download or posts the attempted comment).

---

### 🛠️ Admin / Instructor

**Admin Dashboard**

- Dedicated `/admin` layout with sidebar navigation and protected access (admin role only).
- Overview cards and quick links for common admin tasks.

**Content Management**
| Resource | Actions |
|----------|---------|
| Papers | Upload (PDF via Cloudinary), edit metadata, soft delete, track downloads & likes |
| Notes | Upload, edit, soft delete, track downloads & likes |
| Subjects | Create, edit, delete — with code, year, and lab flag |

**Announcements**

- Create, edit, and delete announcements.
- Mark items as **important** — surfaced on the student home page.

**Analytics**

- Aggregate stats: total papers, notes, downloads, and users.
- Derived metrics: downloads per user and per resource.

---

## Tech Stack

### Frontend

| Technology            | Version |
| --------------------- | ------- |
| React                 | 19      |
| React Router DOM      | v7      |
| Tailwind CSS          | v4      |
| Vite                  | v7      |
| React Hook Form       | –       |
| react-icons (Feather) | –       |
| ESLint                | v9      |

### Backend

| Technology              | Version / Notes       |
| ----------------------- | --------------------- |
| Node.js (ES Modules)    | –                     |
| Express.js              | v5                    |
| MongoDB                 | v7                    |
| Mongoose                | v9                    |
| JWT + HTTP-only Cookies | Auth & security       |
| bcryptjs                | Password hashing      |
| Multer                  | v2 – file uploads     |
| Cloudinary SDK          | PDF hosting           |
| dotenv                  | Environment variables |
| Nodemon                 | Dev tool              |

---

## Architecture

### Backend (MVC)

**Models**
`User` · `Papers` · `Notes` · `Subject` · `Comment` · `Favorites` · `Announcement`

**Controllers**
`user` · `paper` · `notes` · `subject` · `comment` · `favorite` · `announcement` · `analytics`

**Routes**

| Route            | Description              |
| ---------------- | ------------------------ |
| `/user`          | User auth and profile    |
| `/paper`         | Paper management         |
| `/notes`         | Notes management         |
| `/subject`       | Subject management       |
| `/favorite`      | Favorites                |
| `/comments`      | Comments and discussions |
| `/analytics`     | Platform analytics       |
| `/announcements` | Announcements            |

**Middleware**

- `auth.middleware` – JWT / legacy token verification and admin-only guard.
- Upload error handling for Multer.

---

### Frontend

**Pages**

| Area    | Pages                                                                                                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Student | `Home`, `Papers`, `Notes`, `ViewPaper`, `Favorites`, `Profile`, `Login`, `Register`, `Discussions`                                                                                                                             |
| Admin   | `AdminDashboard`, `AdminHome`, `UploadPaper`, `ManagePapers`, `EditPaper`, `UploadNote`, `ManageNotes`, `EditNote`, `ManageSubjects`, `CreateSubject`, `EditSubject`, `Announcements`, `Analytics`, `CreateAdmin` _(optional)_ |

**Shared Components**
`Navbar` · `Footer` · `ProtectedRoute` · `ResourceCard`

**Utilities**

- `utils/auth.js` — API wrapper (`apiFetch`), auth helpers (`getAuthUser`, `logout`), and pending-action handling for post-login resume.

---

## Authentication & Authorization

### Login & JWT

- **Endpoint:** `POST /user/login`
- On successful login:
  - A **JWT access token** is issued (signed with `JWT_SECRET`).
  - Token is sent back to the client and stored in an **HTTP-only cookie**.
  - A backward-compatible legacy token (stored in MongoDB) is also maintained for older clients that send `x-auth-token`.

### Auth Middleware

The `auth` middleware accepts tokens from:

- HTTP-only cookie (`token`)
- `Authorization: Bearer <token>`
- `x-auth-token` (JWT or legacy DB token)

It attaches the user to `req.user`, or returns:

- `401 Unauthorized` — for missing/invalid tokens
- `503` — if the database is unavailable

The `adminOnly` middleware ensures `req.user.role === 'admin'`.

### Protected vs Public Routes

| Access Level  | Routes                                                                             |
| ------------- | ---------------------------------------------------------------------------------- |
| **Public**    | Home, announcements, browsing papers/notes, viewing resources, search & filter     |
| **Protected** | Downloads, favorites, comments, likes, profile routes, all admin routes, analytics |

> On the frontend, protected actions check for auth and redirect to `/login` while recording the intended action. After login, the app replays the pending action automatically.

---

## Getting Started

### Prerequisites

- **Node.js** — v20.19+ or v22.12+ (compatible with Vite)
- **npm**
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Cloudinary** account — for PDF hosting

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd <project-root>

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create a `backend/.env` file (reference `backend/.env.example`):

```env
PORT=5000
MONGO_DB_URL=<your-mongodb-connection-string>
CLOUD_NAME=<cloudinary_cloud_name>
CLOUD_API_KEY=<cloudinary_api_key>
CLOUD_API_SECRET=<cloudinary_api_secret>
JWT_SECRET=<long_random_secret_string>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
```

Create a `frontend/.env` file:

```env
VITE_API_BASE=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=<same-google-oauth-client-id>
```

> ⚠️ If using MongoDB Atlas, add your machine's IP to the **Network Access** whitelist.

### 3. Run the Backend

```bash
cd backend
npm run dev
```

- Server: `http://localhost:5000`
- Health check: `GET /health` → returns JSON with DB connection state

### 4. Run the Frontend

```bash
cd frontend
npm run dev
```

- Vite dev server: `http://localhost:5173`
- The frontend is pre-configured to communicate with `http://localhost:5000` via CORS.

---

## Folder Structure

```
project-root/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── utils/
    ├── main.jsx
    ├── App.jsx
    └── package.json
```

---

## Development Notes

### Linting

```bash
cd frontend && npm run lint
```

### JWT Behavior

Tokens are validated **server-side only**. The frontend uses `getAuthUser()` (which calls `GET /user/me`) to derive the current user's auth state.

### Error Handling

The backend returns **JSON error responses** (no HTML error pages) with explicit HTTP status codes to simplify frontend error handling.
