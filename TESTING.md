# LERA Testing Guide

## Frontend

```powershell
cd client
npm.cmd run test:run
npm.cmd run lint
npm.cmd run build
```

Tests use Vitest, jsdom and Testing Library. The current suite covers:

- API error normalization (backend messages, validation details, network,
  timeout and cancellation).
- KES/date formatting, event normalization and pagination helpers.
- `EventCard` states: on sale, low availability, sold out, past, recommendation
  reason and missing data.
- `TicketSelector`: signed-out prompt, booking payload, server confirmation,
  server error display and sold-out state.
- `RecommendationSection`: real items, data-driven/AI labels, empty state, retry
  and preference query.
- `ProtectedRoute`: loading, login redirect, role rejection and authorised
  rendering.
- Home: API request parameters, real event rendering, error state.

Run a single file:

```powershell
npx.cmd vitest run src/test/components/TicketSelector.test.jsx
```

## Backend

Tests use the Python standard library `unittest`; no extra test dependency is
required. They create an isolated in-memory SQLite database, so the development
database is never modified.

```powershell
cd backend
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

macOS/Linux:

```bash
cd backend
./.venv/bin/python -m unittest discover -s tests -v
```

The suite covers:

- Health check and both legacy array / paginated event responses.
- Search, category, price, upcoming and invalid-sort filters.
- Event detail and 404 handling.
- Registration rules (including blocked admin signup), login, `/me`, logout and
  invalid credentials.
- Booking authentication, server-side price calculation, atomic capacity,
  overselling, past events, cancellation/release and ownership checks.
- Payment status transition (no real processor).
- Organizer-only event creation and capacity reduction protection.
- Recommendation eligibility, ranking reasons, seed/booking/sold-out exclusion
  and invalid parameters.

## Manual integration checklist

1. Start the backend on `5555` and the frontend on `5173`.
2. Confirm the home page shows real upcoming events and no placeholder data.
3. Search/filter/sort on `/events`, then change the page.
4. Sign in as `attendee1@lera.com` / `password123`.
5. Reserve seats on an event and verify the reference and KES total.
6. Confirm the booking; verify it appears on `/bookings`.
7. Cancel it; refresh and verify the event's available seats increased.
8. Sign in as `organizer@lera.com`, create an event, then edit it.
9. Set interests/budget in the recommendation panel and verify the reasons and
   available events.
10. Sign in as `admin@lera.com` and open `/admin`.

## Build verification

`npm.cmd run build` must complete without unresolved imports. The build output
is `client/dist`. Warnings about stale browserslist data do not fail the build.
