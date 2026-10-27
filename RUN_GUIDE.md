# LERA Run Guide

This guide covers local development on Windows, macOS and Linux.

## Prerequisites

- Python 3.12
- Node.js 20+ and npm
- Git

## 1. Backend Setup

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

macOS/Linux:

```bash
cd backend
python3.12 -m venv .venv
./.venv/bin/python -m pip install --upgrade pip
./.venv/bin/python -m pip install -r requirements.txt
```

`backend/.env` is loaded automatically. The default development settings are:

```dotenv
DATABASE_URL=sqlite:///app.db
SECRET_KEY=dev-only-change-me
FRONTEND_URLS=http://localhost:5173,http://127.0.0.1:5173
```

`sqlite:///app.db` resolves to `backend/instance/app.db`.

### Create tables

Tables and the additive `reserved_seats` / `image_url` columns are created when
the app starts. There is no Alembic history to run.

### Optional demo data

```powershell
cd backend
.\.venv\Scripts\python.exe mega_seed.py
```

> **Destructive:** `mega_seed.py` deletes existing events, bookings, reviews and
> categories before inserting demo data. Never run it against production.

The seed creates 10 categories, six demo users, 18 future events and sample
bookings/reviews. Dates are relative to the day you run the script, so events do
not immediately appear past.

### Start the API

```powershell
cd backend
.\.venv\Scripts\python.exe server\app.py
```

Expected output:

```text
Database tables created/verified
 * Running on http://127.0.0.1:5555
```

Verify:

```powershell
curl http://localhost:5555/api/health
# {"status":"healthy"}
```

## 2. Frontend Setup

```powershell
cd client
npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:5173`.

`client/.env.development` sets `VITE_API_BASE_URL=/api`. Vite proxies `/api/*` to
`http://localhost:5555` (see `client/vite.config.js`), so the browser sends the
Flask session cookie as a same-origin cookie. Do not change these two settings
independently.

## 3. Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@lera.com` | `password123` |
| Organizer | `organizer@lera.com` | `password123` |
| Attendee | `attendee1@lera.com` | `password123` |

## 4. Useful Commands

| Task | Command |
| --- | --- |
| Backend tests | `cd backend && .\.venv\Scripts\python.exe -m unittest discover -s tests -v` |
| Frontend tests | `cd client && npm.cmd run test:run` |
| Frontend lint | `cd client && npm.cmd run lint` |
| Production build | `cd client && npm.cmd run build` |
| Preview build | `cd client && npm.cmd run preview` |

On macOS/Linux, replace `.\.venv\Scripts\python.exe` with `./.venv/bin/python`
and `npm.cmd` with `npm`.

## 5. Production Build

```powershell
cd client
npm.cmd run build
```

The output is written to `client/dist`. Serve it with any static host. Set
`VITE_API_BASE_URL` at build time when the API is on another origin, for
example:

```dotenv
VITE_API_BASE_URL=https://api.example.com/api
```

Backend production checklist:

1. Set a strong random `SECRET_KEY`.
2. Use a persistent `DATABASE_URL` (PostgreSQL recommended).
3. Set `FRONTEND_URLS` to the deployed frontend origin(s).
4. Serve over HTTPS and set `SESSION_COOKIE_SECURE=1`.
5. If the frontend and API are on different sites, set
   `SESSION_COOKIE_SAMESITE=None` and configure CORS credentials correctly.
6. Run behind gunicorn, for example:
   `gunicorn -w 2 -b 0.0.0.0:5555 server.app:create_app()`
7. Do not commit `.env` files containing real secrets.

## Troubleshooting

### "Cannot reach the LERA API"

- Confirm the backend is running on port `5555`.
- Confirm `client/.env.development` contains `VITE_API_BASE_URL=/api`.
- Confirm the Vite proxy target in `client/vite.config.js` is
  `http://localhost:5555`.
- Restart `npm run dev` after changing any `.env` file.

### Login succeeds but `/api/auth/me` returns 401

- The browser may be blocking cookies. With the Vite proxy, the API must be
  reached through `/api`, not directly via a different origin.
- In cross-site production, use HTTPS, `SESSION_COOKIE_SECURE=1`,
  `SESSION_COOKIE_SAMESITE=None`, and an exact `FRONTEND_URLS` origin.

### Port already in use

- Backend: set `PORT`, for example `$env:PORT=5556` before starting, and update
  the Vite proxy target to match.
- Frontend: stop the other Vite process or run `npm run dev -- --port 5174`.

### PowerShell blocks `npm`

Use `npm.cmd` in this environment, or adjust the execution policy for your user.

### Database schema errors after pulling changes

The app attempts idempotent `ALTER TABLE` statements for `reserved_seats` and
`image_url`. If a database is inconsistent, back it up and recreate the
development database with `mega_seed.py`.
