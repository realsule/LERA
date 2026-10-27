# LERA Handover Notes

## Current State

The project is a working local full-stack event marketplace:

- React 19 frontend served by Vite on `5173`.
- Flask API on `5555`, using SQLite in development.
- Cookie-session authentication with attendee, organizer and admin roles.
- Real event discovery, booking, cancellation, dashboards, reviews and
  recommendations.
- 25 backend integration tests, 38 frontend tests, clean lint and a successful
  production build.

Start with [RUN_GUIDE.md](RUN_GUIDE.md). The API contract is in
[API_ENDPOINTS.md](API_ENDPOINTS.md), and the audit is in
[PROJECT_AUDIT.md](PROJECT_AUDIT.md).

## Key Decisions

### Authentication

The backend already used Flask's signed session cookie. The frontend was
rewritten to use it (`withCredentials: true`) instead of inventing a JWT. In
development, `/api` is proxied through Vite so cookies stay same-origin. There is
no token in `localStorage` and no client-readable secret.

### API compatibility

`GET /api/events/` still returns a plain array when no pagination parameter is
present. The frontend sends `page`/`per_page`, so it receives
`{items, pagination, filters}`. This avoids breaking older callers.

### Capacity

`Event.reserved_seats` is the authoritative counter. Booking uses a conditional
SQL `UPDATE` so concurrent requests cannot oversell. Cancellation uses a similar
conditional decrement and is idempotent. Client-supplied totals are ignored.

### Schema changes

`reserved_seats` and `image_url` were added without a formal Alembic migration.
`create_app` performs idempotent `ALTER TABLE` statements for existing SQLite
databases. If the project adopts migrations later, create an initial revision
that reflects the current models and retire this compatibility block.

### Recommendations

The default ranker is deterministic and needs no paid key. It scores real,
future, available events by category/keyword interests, budget, location, seed
event similarity, recency, fill ratio and booking history. Reasons are generated
from the actual fields used.

AI is optional and server-side only (`AI_API_KEY`). The model may reorder only
the candidate IDs supplied by the server. Unknown IDs are discarded, reasons are
truncated, and any provider failure falls back to the deterministic result. No
user identity or booking rows are sent to the provider.

### Images

No stock photos are used. If `image_url` is absent, the UI renders a
deterministic category gradient and icon, labelled as a placeholder. This avoids
implying that an unreported photo exists.

## Environment and Deployment

Required backend variables and frontend variables are documented in
[README.md](README.md#environment-variables). Critical production steps:

1. Replace the development `SECRET_KEY` with a strong random value.
2. Use a persistent database and back it up.
3. Set `FRONTEND_URLS` to the exact frontend origin.
4. Serve over HTTPS with `SESSION_COOKIE_SECURE=1`.
5. For cross-site cookies, set `SESSION_COOKIE_SAMESITE=None`.
6. Build the frontend with the correct `VITE_API_BASE_URL`.

## Known Limitations

- **Payments:** there is no card processor. `/api/payments/process` only changes
  a booking from `pending` to `confirmed`. The UI says so. Do not describe this
  as a real payment until a provider and server-side webhook verification exist.
- **Refunds:** cancellation releases seats but no money moves because no money
  was collected.
- **Account recovery:** no email verification, password reset or email delivery.
- **Uploads:** `image_url` accepts a URL; there is no file storage.
- **AI verification:** the AI fallback and ID validation are implemented, but
  the live provider path was not tested with a real paid key.
- **Rate limiting/CSRF:** not implemented. Cookie `SameSite` settings provide
  some protection, but a public deployment should add rate limiting and a CSRF
  strategy if cross-site cookies are enabled.
- **Legacy files:** `EventDetail2.jsx`, `UserProfile.jsx`, `VenueDetail.jsx` and
  `DebugPanel.jsx` are unused and excluded from lint. They can be deleted after
  confirming no branch depends on them.
- **Seed script:** `mega_seed.py` deletes development data. Never run it in
  production.

## Ownership

| Area | Primary owner | Notes |
| --- | --- | --- |
| Backend API, database, auth, recommendations | Abdifatah | Review the session-cookie CORS settings before deployment. |
| Frontend application and UX | Suleiman | Components use the shared API client; keep data states honest. |
| Requirements, content and visual QA | Sydney | Verify copy and flows against the Figma/requirements. |

## Recommended Next Steps

1. Add a real payment provider with server-side webhook confirmation and refund
   handling; keep the current endpoint only as a development stub.
2. Add email verification and password reset.
3. Add Alembic migrations and remove the startup `ALTER TABLE` compatibility.
4. Add rate limiting and CSRF protection for production.
5. Add organizer image upload/storage.
6. Run an accessibility audit with a browser tool and keyboard-only testing.
7. Exercise the optional AI path with a real key and add a test that mocks the
   provider response.
8. Remove unused legacy pages after a branch/dependency check.
9. Add CI for backend tests, frontend tests, lint and build.

## Commands

```powershell
# Backend
cd backend
.\.venv\Scripts\python.exe mega_seed.py
.\.venv\Scripts\python.exe server\app.py
.\.venv\Scripts\python.exe -m unittest discover -s tests -v

# Frontend
cd client
npm.cmd run dev
npm.cmd run test:run
npm.cmd run lint
npm.cmd run build
```
