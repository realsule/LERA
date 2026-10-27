# LERA Project Audit

Audit date: 2026-10-23

## Scope

The repository was audited before changes were made. The goal was to connect
the existing React frontend to the real Flask API, remove fabricated data, add
working recommendations and verify the main workflows without rebuilding the
project from scratch.

## What Was Found

### Backend

- Flask application factory and blueprints existed and could run, but the docs
  claimed JWT authentication while the code actually used Flask session cookies.
- `GET /api/events/` had no search, filter, sort or pagination support.
- Event serialization did not expose reliable availability. Booking capacity was
  checked non-atomically against a derived count.
- Booking totals were accepted from the client.
- Cancellation did not release capacity consistently.
- No recommendation endpoint existed.
- The schema had no `reserved_seats` or `image_url` columns.
- There was no automated test suite.
- The seeded demo events were dated in the past as of the audit date, so a fresh
  seed produced an empty "upcoming" marketplace.

### Frontend

- The API base URL and Vite proxy disagreed (`VITE_API_URL=http://localhost:5555`
  while the proxy targeted port `5000`).
- Several pages used hardcoded arrays, invented attendees, revenue, ratings and
  ticket types instead of API data.
- Auth code expected a browser-readable JWT/token, which the backend never
  issued.
- Event detail and booking flows did not match real backend fields.
- The event form, attendee bookings page and several navigation links were
  missing or pointed at nonexistent routes.
- Loading, empty, error and sold-out states were inconsistent.
- Tests targeted an old event shape and failed.
- Abandoned files (`EventDetail2.jsx`, `UserProfile.jsx`, `VenueDetail.jsx`,
  `DebugPanel.jsx`) contained syntax errors or unused mock logic and were not
  routed.

### Documentation

- README, RUN_GUIDE and API_ENDPOINTS described JWT, old commands, old ports and
  endpoints that did not exist (`/auth/refresh`, `/payments/{id}`, and others).

## What Was Kept

- Flask app factory, blueprints, SQLAlchemy models, bcrypt password handling and
  the existing route structure.
- React/Vite/Tailwind setup, router, context pattern and existing design system
  conventions.
- Existing seed scripts as the basis for demo data, updated for relative dates
  and current schema.

## What Changed

### Backend

- Added event filters (`q`, `category`, `min_price`, `max_price`, `date_from`,
  `date_to`, `upcoming`, `available`) and sorting.
- Added opt-in pagination while preserving the legacy array response.
- Added `reserved_seats` and `image_url`, plus idempotent startup column
  compatibility for existing SQLite databases.
- Rewrote booking creation to reserve seats with a single conditional SQL
  `UPDATE`, calculate totals from the event record and return references.
- Made cancellation idempotent and release seats atomically.
- Added the recommendations endpoint with deterministic content scoring,
  booking-history personalisation and optional server-side AI reranking.
- Added role-protected event creation/editing and consistent JSON errors.
- Reseeded development data with future dates.

### Frontend

- Centralized API access in `client/src/services/api.js` with
  `VITE_API_BASE_URL`, credentials, timeouts, cancellation and normalized errors.
- Replaced token auth with cookie-session `AuthContext`.
- Rebuilt discovery, event detail, create/edit, bookings, dashboard, login,
  register, about and 404 routes around real data.
- Added reusable formatting (`KES`, dates, normalization), image placeholders,
  skeletons, recommendation panel and ticket selector.
- Removed fabricated event, attendee, revenue and rating data from routed pages.
- Added honest labels around the non-functional payment flow.

### Tests and docs

- Replaced the old frontend tests and added suites for API errors, formatting,
  event cards, booking, recommendations, protected routes and home.
- Added 25 backend integration tests using isolated in-memory SQLite.
- Rewrote README, RUN_GUIDE, API_ENDPOINTS, TESTING and backend/TESTING.

## Verification Performed

- Backend: `25` unittest cases pass.
- Frontend: `38` Vitest cases pass.
- Frontend lint: clean.
- Production build: succeeds.
- Manual API smoke tests were run against the development server for
  pagination, search, event detail, recommendations, login/me, booking,
  capacity decrement, cancellation/release and role rejection.

## Known Gaps

- No real payment gateway, refunds, email verification or password reset.
- No file upload; events accept an image URL only.
- Optional AI path was implemented defensively but not exercised against a live
  paid provider in this environment.
- Legacy unreferenced pages remain in the repository and are excluded from lint
  rather than deleted.
- The tracked development `backend/.env` uses a weak placeholder secret.
