# Backend Testing Guide

The backend uses Python's standard-library `unittest`; installing pytest is not
required.

## Run

```powershell
cd backend
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

macOS/Linux:

```bash
cd backend
./.venv/bin/python -m unittest discover -s tests -v
```

## How tests are isolated

`backend/tests/test_api.py` calls `create_app()` with:

- `TESTING=True`
- `SQLALCHEMY_DATABASE_URI=sqlite://` (in-memory)
- a test-only `SECRET_KEY`
- `AI_API_KEY=''`

Each test gets a fresh schema and seed data, so `backend/instance/app.db` is
never modified.

## Coverage

- Health and event listing (legacy array and paginated forms)
- Search, category, price, date/upcoming and sort validation
- Event detail and 404 handling
- Registration rules, login, session restore, logout and invalid credentials
- Booking authentication, server-side totals, atomic capacity and oversell
- Past-event booking rejection
- Cancellation/release, idempotency and ownership checks
- Payment status transition (no card processor)
- Organizer-only event creation and capacity protection
- Recommendation eligibility, ranking, exclusions and invalid parameters

## Manual API checks

Run the server and use `curl`:

```powershell
curl "http://localhost:5555/api/events/?page=1&per_page=6&upcoming=true&available=true"
curl "http://localhost:5555/api/recommendations?interests=music&budget=5000&limit=3"
curl -c cookies.txt -X POST http://localhost:5555/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"attendee1@lera.com","password":"password123"}'
curl -b cookies.txt http://localhost:5555/api/auth/me
```

Use `-b cookies.txt` on follow-up booking requests to send the session cookie.

## Frontend

See [../TESTING.md](../TESTING.md) for Vitest, lint and production-build
commands.
