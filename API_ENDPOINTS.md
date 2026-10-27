# LERA API Reference

Base URL in development: `http://localhost:5555/api`
(through the frontend: `/api`)

Authentication uses a Flask `HttpOnly` session cookie. Send requests with
credentials enabled (`withCredentials: true` in Axios). There is no JWT and no
token in `localStorage`.

Roles: `attendee`, `organizer`, `admin`.

## Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | `{"status":"healthy"}` |

## Authentication

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create an attendee or organizer account and start a session |
| POST | `/auth/login` | Public | Start a session with email and password |
| GET | `/auth/me` | Session | Return the current user |
| POST | `/auth/logout` | Public | Clear the session |

Register body:

```json
{
  "username": "attendee3",
  "email": "attendee3@example.com",
  "password": "password123",
  "role": "attendee"
}
```

`role` may only be `attendee` or `organizer`. Admin accounts cannot be
self-registered. Passwords must be at least 8 characters.

Login body:

```json
{ "email": "attendee1@lera.com", "password": "password123" }
```

User response:

```json
{
  "id": 3,
  "username": "attendee1",
  "email": "attendee1@lera.com",
  "role": "attendee",
  "created_at": "2026-10-23T12:00:00"
}
```

## Events

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/events/` | Public | List/filter/sort events |
| GET | `/events/{id}` | Public | Event detail |
| GET | `/events/my-events` | Session | Events owned by the current organizer (admin may pass `all=true`) |
| POST | `/events/` | Organizer/admin | Create an event |
| PUT | `/events/{id}` | Owner/admin | Update an event |
| DELETE | `/events/{id}` | Owner/admin | Delete an event and its bookings/reviews |

### List query parameters

| Parameter | Meaning |
| --- | --- |
| `q` | Case-insensitive search in title, description and location (max 100 chars) |
| `category` | Category name or numeric category ID. Unknown names return no events. |
| `min_price`, `max_price` | Inclusive KES price bounds |
| `date_from`, `date_to` | ISO date/datetime bounds |
| `upcoming` | `true`/`1` = future only; `false`/`0` = past only; `all`/`any` = both |
| `available` | `true` = only events with seats remaining |
| `sort` | `date_asc`, `date_desc`, `price_asc`, `price_desc`, `title_asc`, `newest`, `popular` |
| `page`, `per_page` | Enables the paginated response. `per_page` is capped at 100. |

If none of `page`, `per_page` or `paginate` is supplied, the endpoint keeps its
legacy shape and returns a plain array. Otherwise it returns:

```json
{
  "items": [ { "id": 1, "title": "Nairobi Jazz Night", "...": "..." } ],
  "pagination": {
    "page": 1,
    "per_page": 12,
    "total": 18,
    "total_pages": 2,
    "has_next": true,
    "has_prev": false
  },
  "filters": {
    "q": "",
    "category": "",
    "min_price": "",
    "max_price": "",
    "date_from": "",
    "date_to": "",
    "sort": "date_asc",
    "upcoming": "true"
  }
}
```

Event response fields include:
`id, title, description, date, location, price, capacity, image_url,
reserved_seats, available_tickets, is_sold_out, is_past, tickets_sold, revenue,
average_rating, review_count, organizer_id, organizer{id,username},
category_id, category{id,name}, category_name, created_at`.

`available_tickets` is derived as `capacity - reserved_seats`, clamped at zero.
`price` is in KES.

Create/update body:

```json
{
  "title": "Nairobi Jazz Night",
  "description": "Live jazz from Kenyan artists.",
  "date": "2026-12-12T19:00:00",
  "location": "Alliance Française, Nairobi",
  "price": 1500,
  "capacity": 120,
  "image_url": "https://example.com/cover.jpg",
  "category_id": 3
}
```

Validation errors return:

```json
{ "error": "Validation failed", "details": { "capacity": "Capacity is required" } }
```

Capacity cannot be reduced below `reserved_seats` (409).

## Categories

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/categories/` | Public | List categories with `event_count` |

## Bookings

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/bookings/` | Session | Reserve seats |
| GET | `/bookings/` | Session | List the current user's bookings |
| GET | `/bookings/{id}` | Owner/admin | Booking detail |
| DELETE | `/bookings/{id}` | Owner/admin | Cancel a booking and release its seats |

Create body:

```json
{
  "event_id": 1,
  "tickets_count": 2,
  "special_requests": "Wheelchair access"
}
```

The server calculates `total_price = event.price * tickets_count`; any
client-supplied total is ignored. The reservation is atomic:

- past events: 409
- more tickets than remain: 409 with `available_tickets`
- success: 201 with `status: "pending"` and a `LERA-000123` reference

Cancellation is idempotent: cancelling an already-cancelled booking returns it
without releasing seats a second time.

## Payments (not a real card processor)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/payments/process` | Session | Mark a pending booking as `confirmed` |

Body: `{ "booking_id": 10 }`

This project has **no payment provider integration**. No card is charged. The
endpoint only changes booking status; the UI states this explicitly.

## Reviews

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/reviews/event/{event_id}` | Public | Reviews for an event |
| POST | `/reviews/` | Session | Create one review per user per event |

Body: `{ "event_id": 1, "rating": 5, "comment": "Great event" }`.
Rating must be 1-5. Duplicate reviews return 409.

## Recommendations

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/recommendations` | Public (personalised when signed in) | Ranked real, available future events |

Query parameters:

| Parameter | Meaning |
| --- | --- |
| `interests` | Comma-separated categories/keywords, max 10 |
| `budget` | Maximum KES price used for ranking (non-negative) |
| `location` | Location keyword |
| `event_id` | Seed event for "similar events" (excluded from results) |
| `limit` | 1-20, default 6 |

Response:

```json
{
  "items": [
    {
      "event_id": 3,
      "reason": "Matches your interest in music · Within your selected budget",
      "score": 0.74,
      "event": { "id": 3, "title": "...", "available_tickets": 42 }
    }
  ],
  "strategy": "content_based",
  "ai_configured": false,
  "personalized": false,
  "interests_used": ["music"],
  "generated_at": "2026-10-23T12:00:00Z"
}
```

- `strategy` is `content_based` or `ai_rerank`.
- Results only include future events with seats remaining.
- Signed-in users also get categories from their non-cancelled bookings added to
  their interests, and already-booked events are excluded.
- When `AI_API_KEY` is set, the model may only reorder the same real candidates.
  Invalid IDs are discarded; provider errors fall back to deterministic ranking.
- No user identity or booking history is sent to the AI provider.

## Admin

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/admin/users` | Admin | All users |
| GET | `/admin/events` | Admin | All events |
| GET | `/admin/analytics` | Admin | Counts and non-cancelled booking value |
| GET | `/admin/events/pending` | Admin | Always `[]` (no approval workflow exists) |

## Error Format

```json
{ "error": "Human-readable message" }
```

Validation failures may include `details`. Common status codes: 400 validation,
401 not signed in, 403 wrong role/ownership, 404 missing record, 409 conflict
(capacity, past event, duplicate review), 500 unexpected server error.
