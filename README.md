# KreatorAI — full-stack edition

AI-native marketplace connecting AI creators with brands and creative agencies.
This is the full-stack upgrade: the original offline-first React prototype plus
real authentication backed by an Express + PostgreSQL API.

## Architecture

```
kreatorai-fullstack/
├── src/                  # React 18 + Vite + React Router (HashRouter) + plain CSS
│   ├── lib/api.js        # JSON API client (ApiError with status + message)
│   ├── lib/auth.js       # JWT token storage (localStorage, try/catch)
│   ├── state/auth.jsx    # AuthProvider: user, token, login/register/logout, backendUp
│   ├── state/store.jsx   # App store; briefs sync to the API when signed in,
│   │                     # silently falls back to localStorage offline
│   ├── pages/Login.jsx / Register.jsx / Admin.jsx
│   └── components/ProtectedRoute.jsx  # RequireAuth, RequireAdmin
└── server/               # Express 4 + node-postgres API
    ├── src/index.js      # app entry: CORS, JSON, routes, error middleware
    ├── src/db.js         # pg Pool; boots fine with no DB (routes answer 503)
    ├── src/middleware/auth.js  # requireAuth (JWT) + requireAdmin
    ├── src/routes/auth.js      # register / login / me
    ├── src/routes/briefs.js    # brief CRUD, ownership enforced
    ├── src/routes/admin.js     # user list + stats (admin only)
    └── src/seed.js             # creates tables + admin account
```

**How auth works.** Register/login return a JWT (7-day expiry) stored in
`localStorage` under `kreatorai_token`. Every API call sends
`Authorization: Bearer <token>`. The frontend checks `/api/health` on load:
if the API (or its database) is unreachable, the whole app keeps working
offline on localStorage and shows a small dismissible notice — nothing breaks.

**How brief sync works.** Brief ids stay stable local uids so shortlists,
stages and notes keep working. When you're signed in and the backend is up,
saves/deletes are mirrored to `/api/briefs` in the background (the UI never
waits). Signing in pulls your server briefs down and pushes any local-only
ones up. Signing out removes server-synced briefs from the browser.

## Run it locally

### 1. PostgreSQL
Install PostgreSQL 14+ and create the database:
```bash
createdb kreatorai
# or: psql -c "CREATE DATABASE kreatorai;"
```

### 2. Backend
```bash
cd server
cp .env.example .env
# edit .env: set DATABASE_URL, a long random JWT_SECRET,
# and a real ADMIN_PASSWORD (change the placeholder!)
npm install
npm run seed    # creates tables + admin account
npm start       # API on http://localhost:4000
```

### 3. Frontend
```bash
# project root, in another terminal
cp .env.example .env        # optional; defaults to http://localhost:4000
npm install
npm run dev                 # app on http://localhost:5173
```

Open http://localhost:5173, click **Sign up**, create an account, and post a
brief — it will persist in PostgreSQL. Sign in as the admin (the email/password
from `server/.env`) and visit **Admin** to see users and stats.

> No database? The API still boots (`/api/health` → `{"ok":true,"db":false}`)
> and the frontend runs fully offline. Briefs just won't sync.

## API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/health | — | `{ok, db}` liveness |
| POST | /api/auth/register | — | `{name, email, password}` → 201 `{token, user}`; 409 if email taken |
| POST | /api/auth/login | — | `{email, password}` → `{token, user}`; 401 on any failure |
| GET | /api/auth/me | user | current user (never the password hash) |
| GET | /api/briefs | user | own briefs; admin `?all=1` sees all + owner emails |
| POST | /api/briefs | user | `{title*, brand_name?, status?, data?}` → 201 |
| GET / PUT / DELETE | /api/briefs/:id | user | own brief or admin; non-owners get 404 (no leaking) |
| GET | /api/admin/users | admin | id, email, name, role, created_at |
| GET | /api/admin/stats | admin | `{users, briefs}` counts |

## Security notes

- Passwords hashed with **bcryptjs (12 rounds)**; the hash never leaves the server.
- Login returns the same `401 Incorrect email or password` whether the email
  exists or not (no account enumeration).
- JWTs signed with `JWT_SECRET`, 7-day expiry; missing/invalid tokens → 401.
- Brief routes enforce ownership; other users' briefs return **404, not 403**,
  so existence isn't leaked. Admin-only routes return 403.
- All user input is parameterized (`$1` placeholders) — no SQL string building.
- `server/.env` is git-ignored and **excluded from the zip**. Only `.env.example`
  (placeholders) ships. Never put `DATABASE_URL` or `JWT_SECRET` in frontend code.
- Change `ADMIN_PASSWORD` from the placeholder before any shared/demo use.
- Demo honesty (unchanged from the prototype): the 14 featured creators are
  fictional; the 100 directory listings are real public finds shown unverified;
  "Send email" opens the visitor's mail app — nothing sends real email.
