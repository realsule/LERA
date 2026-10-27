# LERA - Event Discovery and Booking

LERA is a full-stack event marketplace. Organizers publish events, attendees
discover them, and signed-in attendees reserve seats. The frontend talks to the
real Flask API; prices, availability and recommendations all come from server
data.

## Stack

- **Frontend:** React 19, React Router 7, Vite 7, Tailwind CSS, Axios, Vitest
- **Backend:** Python 3.12, Flask 2.3, SQLAlchemy 2, Flask-SQLAlchemy, Flask-Bcrypt
- **Database:** SQLite for local development; any SQLAlchemy-compatible database
  (for example PostgreSQL) in production
- **Auth:** Flask signed session cookies (`HttpOnly`), not JWT
- **Optional AI:** server-side OpenAI-compatible reranking of real candidate
  events; deterministic content ranking is always available without a key

## Features

- Upcoming-event discovery with search, category, price, date, availability and
  sorting filters plus server-side pagination.
- Event detail pages with live seat counts, reviews, sharing and booking.
- Cookie-based registration, login and session restore.
- Seat reservation with server-side price calculation and atomic capacity
  checks; cancellation releases seats.
- Attendee, organizer and admin dashboards using real endpoints.
- Recommendations ranked by interests, budget, location, booking history and
  actual availability, with human-readable reasons.
- Honest loading, empty, error and success states; KES pricing throughout.

## Quick Start

### 1. Backend

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe mega_seed.py   # optional demo data; dev only
.\.venv\Scripts\python.exe server\app.py
```

The API runs at `http://localhost:5555`. Tables are created on startup. See
[RUN_GUIDE.md](RUN_GUIDE.md) for details and Windows/macOS/Linux variants.

### 2. Frontend

```powershell
cd client
npm install --legacy-peer-deps
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api/*` to
`http://localhost:5555`, so session cookies work as same-origin cookies.

> `--legacy-peer-deps` is required because `react-helmet-async@2.0.5` declares a
> peer dependency on React 18 while this project uses React 19.

After both dependency installs, you can start the API and frontend together from
the repository root with `npm run dev`. The runner also handles WSL when the
dependencies were installed on Windows; see
[RUN_GUIDE.md](RUN_GUIDE.md#wsl-reports-python-not-found-or-a-missing-rollup-package).

### Demo accounts (after `mega_seed.py`)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@lera.com` | `password123` |
| Organizer | `organizer@lera.com` | `password123` |
| Attendee | `attendee1@lera.com` | `password123` |

## Documentation

- [RUN_GUIDE.md](RUN_GUIDE.md) - install, run, seed, build and troubleshoot
- [API_ENDPOINTS.md](API_ENDPOINTS.md) - current API contract and query parameters
- [TESTING.md](TESTING.md) - test commands and coverage
- [PROJECT_AUDIT.md](PROJECT_AUDIT.md) - what was broken and what changed
- [HANDOVER.md](HANDOVER.md) - decisions, limitations, ownership and next steps
- [backend/TESTING.md](backend/TESTING.md) - backend test details

## Environment Variables

### Frontend (`client/.env.development`, `client/.env.production`)

| Variable | Purpose | Development value |
| --- | --- | --- |
| `VITE_API_BASE_URL` | API base URL. A relative value uses the current origin. | `/api` |

The legacy `VITE_API_URL` name is still accepted, but new setups should use
`VITE_API_BASE_URL`. Never put backend secrets in a `VITE_*` variable; Vite
embeds them in the browser bundle.

### Backend (`backend/.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLAlchemy database URL. Defaults to SQLite in `backend/instance`. |
| `SECRET_KEY` | Flask session signing key. **Set a strong random value outside development.** |
| `FRONTEND_URLS` | Comma-separated allowed CORS origins, for example `https://app.example.com`. |
| `SESSION_COOKIE_SAMESITE` | `Lax` by default; use `None` with HTTPS for cross-site deployments. |
| `SESSION_COOKIE_SECURE` | `1` in production HTTPS deployments. |
| `AI_API_KEY` | Optional server-only key for AI reranking. Leave empty to use deterministic ranking. |
| `AI_BASE_URL` | OpenAI-compatible API root, default `https://api.openai.com/v1`. |
| `AI_MODEL` | Reranking model, default `gpt-4o-mini`. |
| `AI_TIMEOUT_SECONDS` | Provider timeout, default `8`. |
| `AI_CACHE_TTL_SECONDS` | Rerank cache lifetime, default `300`. |
| `PORT` | API port, default `5555`. |

## Verification

```powershell
# Backend
cd backend
.\.venv\Scripts\python.exe -m unittest discover -s tests -v

# Frontend
cd client
npm.cmd run test:run
npm.cmd run lint
npm.cmd run build
```

## Limitations

- **No card processor is connected.** The "Confirm booking" action calls
  `/api/payments/process`, which marks a pending booking as confirmed. No card
  is charged and no real payment data is collected.
- Email verification, password reset, refunds and file uploads are not
  implemented.
- Recommendations work without a paid AI key. When AI is configured, the model
  may only reorder real candidate events; invalid IDs are discarded and any
  provider failure falls back to deterministic ranking.
- Production deployment still needs HTTPS, a strong `SECRET_KEY`, a persistent
  database and correct cross-site cookie/CORS settings.
- The development `backend/.env` file contains a placeholder secret. Rotate it
  before any public deployment.
