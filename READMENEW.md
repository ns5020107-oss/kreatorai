# KreatorAI

**An AI-native marketplace connecting brands with content creators.**

KreatorAI is a full-stack web application where visitors can discover creators and explore their portfolios, while registered users can sign in and manage briefs. The project combines a React frontend, an Express API, and a PostgreSQL database.

- **Live website:** https://ns5020107-oss.github.io/kreatorai/
- **GitHub repository:** https://github.com/ns5020107-oss/kreatorai
- **Backend API:** https://kreatorai.onrender.com

> **Project status:** This README describes the known application structure and implemented starter features. Some marketplace actions and integrations may still be in development. Check the current UI and API routes before assuming a feature is fully connected end to end.

---

## Contents

- [What is KreatorAI?](#what-is-kreatorai)
- [Features](#features)
- [Technology stack](#technology-stack)
- [How the application works](#how-the-application-works)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [Environment configuration](#environment-configuration)
- [Database](#database)
- [API overview](#api-overview)
- [Deployment](#deployment)
- [Security notes](#security-notes)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## What is KreatorAI?

KreatorAI is designed to make creator discovery and collaboration easier. Brands and other customers can browse creator profiles and portfolio work, then use briefs to describe a project and organize collaboration.

The application has two main parts:

1. **Frontend:** the website users interact with.
2. **Backend:** the API that handles authentication, validates requests, and reads or writes application data in PostgreSQL.

Keeping the backend separate from the frontend means sensitive operations and database access can remain on the server instead of being performed directly in the browser.

## Features

### Frontend

- Home page and marketplace introduction
- Creator directory and creator profile pages
- Portfolio browsing
- Brief creation and brief listing/detail pages
- Inbox page and informational pages
- Client-side navigation using React Router's `HashRouter`
- Responsive interface and reusable visual components

Creator directory content has included local/static data in `src/data/creators.js` and related directory data. That means **not every creator profile displayed in the UI should be assumed to come from PostgreSQL or the live API**.

### Backend

- User registration and login
- Session-based authentication using cookies
- PostgreSQL data persistence
- User-owned brief operations
- Message-related database structure
- Audit log records
- Admin-oriented functionality, including server-sent events (SSE) where implemented

The API is built with Node.js and Express. Database access is handled by the server, using PostgreSQL.

## Technology stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React | User interface and components |
| Frontend tooling | Vite | Local development server and production build |
| Routing | React Router (`HashRouter`) | Client-side page navigation |
| Backend | Node.js + Express | REST API and server-side business logic |
| Database | PostgreSQL | Users, briefs, messages, and audit logs |
| Authentication | Cookie-based sessions | Maintains a signed-in user's session |
| Frontend hosting | GitHub Pages | Hosts the published static frontend |
| Backend hosting | Render | Runs the API service |
| Database hosting | Render PostgreSQL | Stores persistent application data |

## How the application works

A typical request follows this path:

1. A visitor opens the React website in their browser.
2. React renders the selected page, such as the creator directory or a brief page.
3. When a feature needs server data, the frontend sends an HTTP request to the Express API.
4. The API validates the request and checks authentication/authorization when required.
5. The backend queries or updates PostgreSQL.
6. The API returns a response, and the frontend updates the interface.

```text
Visitor's browser
       |
       v
React + Vite frontend
(GitHub Pages in production)
       |
       | HTTP requests / API
       v
Express backend
(Render service)
       |
       | SQL queries
       v
PostgreSQL database
(Render)
```

### Authentication flow

1. A user submits the registration or login form.
2. The frontend sends the credentials to the backend over HTTP.
3. The backend validates the input and checks or creates the user record.
4. On successful authentication, the server establishes a session using a cookie.
5. Subsequent requests send the session cookie so the server can identify the user.
6. Protected API routes verify the session and enforce ownership or admin permissions.

**Important:** hiding a button in the frontend is not sufficient protection. Any private action must also be checked by the backend before data is returned or changed.

### Brief workflow

The backend includes routes and database support for briefs. In general, a signed-in user can create a brief and access their own brief data. The server should verify ownership whenever a user reads, updates, or deletes a brief.

### Creator directory

Creator discovery currently uses local/static frontend data in the creator data files. This is useful for demonstrating the marketplace experience, but it is different from a database-backed creator marketplace. A future integration could add a creators table and API endpoints so creator profiles can be managed dynamically.

## Architecture

The codebase is organized into a frontend application and a backend service.

### Frontend

The React application is responsible for:

- Rendering pages and reusable components
- Navigation between screens
- Forms and user interactions
- Calling API endpoints where server functionality is needed
- Showing loading, success, and error states

### Backend

The Express server is responsible for:

- Exposing API routes
- Validating request data
- Registering users and authenticating sessions
- Applying authorization and ownership checks
- Communicating with PostgreSQL
- Returning JSON responses and handling errors

### Database

PostgreSQL stores persistent records. The known schema includes tables for:

- `users` — account and profile-related fields
- `briefs` — project briefs
- `messages` — message-related records
- `audit_logs` — audit/event records

Use the SQL migration files in the repository as the source of truth for the exact columns, constraints, and relationships.

## Project structure

The main folders and files include:

```text
kreatorai/
├── src/                       # React frontend
│   ├── data/                  # Static creator and directory data
│   ├── ...                    # Pages, components, styles, and app code
├── server/
│   └── src/
│       ├── index.js            # Express server entry point
│       ├── db.js               # PostgreSQL connection setup
│       ├── seed.js             # Database seed utilities
│       ├── middleware/
│       │   └── auth.js         # Authentication middleware
│       └── routes/
│           ├── auth.js         # Registration/login routes
│           ├── admin.js        # Admin endpoints
│           └── briefs.js       # Brief endpoints
├── sql/
│   └── 001_init.sql            # Initial database schema
├── package.json                # Frontend scripts and dependencies
└── README.md
```

The tree above highlights the known layout. File names may change as the project evolves; use the repository itself as the definitive source.

## Run locally

### Prerequisites

- Node.js 20 or newer
- npm
- A PostgreSQL database (PostgreSQL 14 or newer is a suitable baseline)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ns5020107-oss/kreatorai.git
cd kreatorai
```

### 2. Install frontend dependencies

From the repository root:

```bash
npm install
```

### 3. Configure the backend

Move into the backend directory:

```bash
cd server
npm install
```

Create a `.env` file in the location expected by the backend configuration. The variables commonly used by this project are:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
SESSION_SECRET=replace-with-a-long-random-secret-at-least-32-characters
APP_ORIGIN=http://localhost:5173
PORT=3001
```

Replace the database URL with your own PostgreSQL connection string. Do not commit `.env` files or real credentials to GitHub.

If the backend's `package.json` provides a development script, start it from `server/` with:

```bash
npm run dev
```

If the script name differs, check `server/package.json` and use the script defined there.

### 4. Start the frontend

Open a second terminal, return to the repository root, and run:

```bash
npm run dev
```

Vite commonly serves the frontend at:

```text
http://localhost:5173
```

The frontend development configuration may proxy `/api` requests to the backend at `http://localhost:3001`. If API requests fail locally, confirm that the backend is running and that the proxy target matches the backend port.

### 5. Initialize the database

Create a PostgreSQL database, then apply the schema migration from the repository root using your preferred PostgreSQL client. For example, if `psql` is installed and your database URL is configured:

```bash
psql "$DATABASE_URL" -f sql/001_init.sql
```

On Windows PowerShell, you can also pass the connection URL directly:

```powershell
psql "postgresql://USER:PASSWORD@HOST:5432/DATABASE" -f sql/001_init.sql
```

Use the exact migration path present in your checkout. Do not run a schema migration against a production database unless you have reviewed it and have a backup.

## Environment configuration

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret used to secure session data; use a long, random value |
| `APP_ORIGIN` | Allowed frontend origin for CORS/session-related configuration |
| `PORT` | Port for the Express server, if supported by the server configuration |
| `ADMIN_EMAIL` | Email used when creating/configuring an admin account, if the admin setup script uses it |
| `ADMIN_PASSWORD` | Password used by the admin setup script; use a strong password |
| `ADMIN_NAME` | Optional display name for the admin setup script |

Only configure variables that are actually read by the current code. Check the backend configuration and package scripts before adding optional values. Keep all secrets in local environment files or your hosting provider's environment settings.

## Database

The database is PostgreSQL. The application server connects using `DATABASE_URL`; the browser should never connect directly to the database.

Known tables include:

| Table | Purpose |
|---|---|
| `users` | User accounts and related profile fields |
| `briefs` | Project briefs and ownership |
| `messages` | Message-related data |
| `audit_logs` | Audit records |

The SQL migration files define the authoritative schema. When changing database columns, update the migration/schema and the relevant backend queries together.

## API overview

The backend groups API functionality into route modules. Known modules include:

| Route module | Responsibility |
|---|---|
| `auth.js` | Registration and login |
| `briefs.js` | Brief-related operations |
| `admin.js` | Admin-only operations |

The exact URL paths, HTTP methods, request bodies, and response formats should be read from the route files in `server/src/routes/`. This README intentionally does not invent endpoint paths that may change during development.

For API debugging, check:

1. The browser's developer console and Network tab.
2. The Express server logs.
3. The database connection and schema.
4. Whether the request includes the session cookie when required.
5. Whether the API's configured frontend origin matches the frontend URL.

## Deployment

### Frontend — GitHub Pages

The live frontend is published at:

https://ns5020107-oss.github.io/kreatorai/

GitHub Pages serves static frontend files. It does not run the Express backend or host the PostgreSQL database. API requests from the deployed site must target the deployed backend URL, and the backend must allow the frontend origin.

### Backend — Render

The API service is hosted at:

https://kreatorai.onrender.com

Configure the backend's environment variables in the Render dashboard. Keep `DATABASE_URL` and `SESSION_SECRET` private. Ensure the service's start command matches the backend package scripts.

### Database — Render PostgreSQL

The project uses a Render PostgreSQL database. Configure the backend with the database connection string supplied by Render. Use the correct internal or external connection URL for the environment where the backend runs.

### Deployment checklist

- [ ] Frontend production build completes successfully.
- [ ] Frontend API base URL points to the deployed backend.
- [ ] Backend environment variables are configured in Render.
- [ ] PostgreSQL schema migrations have been applied.
- [ ] CORS/origin settings allow the deployed frontend.
- [ ] Cookies and session settings are compatible with the production HTTPS domains.
- [ ] Registration, login, logout, and protected routes are tested after deployment.
- [ ] No secrets or database credentials are committed to the repository.

## Security notes

- Never commit `.env`, passwords, session secrets, or database credentials.
- Validate user input on the server.
- Use parameterized SQL queries rather than string-concatenated SQL.
- Hash passwords with a suitable password-hashing algorithm; never store plaintext passwords.
- Protect private endpoints with authentication and authorization middleware.
- Verify record ownership on every user-specific read or write.
- Use HTTPS in production.
- Configure cookies securely for production, including `HttpOnly`, `Secure`, and an appropriate `SameSite` policy.
- Restrict admin endpoints to authorized admin accounts.
- Do not rely on frontend-only checks to secure API actions.

## Roadmap

Possible next steps for evolving KreatorAI include:

- Connect creator profiles to PostgreSQL instead of static frontend data.
- Add a complete messaging workflow backed by the API.
- Add service requests/orders and clear request status tracking.
- Add favorites/saved creators for signed-in users.
- Add a friendly login/signup prompt when a guest selects a restricted action, while keeping public creator browsing open.
- Add automated tests for authentication, ownership, and core API routes.
- Document the API endpoints and database relationships in detail.

Roadmap items are ideas for further development, not a claim that each feature is already implemented.

## Contributing

1. Fork the repository or create a feature branch.
2. Make a focused change.
3. Test the frontend and backend behavior affected by the change.
4. Never include real credentials in commits.
5. Submit a pull request with a clear summary and testing notes.



---

**KreatorAI** — discover creators, organize briefs, and build better collaborations.
