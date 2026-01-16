# API Endpoints Reference

## Authentication Endpoints
```
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
GET    /api/auth/me               # Get current user
POST   /api/auth/refresh          # Refresh JWT token
POST   /api/auth/logout            # User logout
POST   /api/auth/forgot-password    # Reset password request
POST   /api/auth/reset-password     # Password reset confirmation
```

## Event Endpoints
```
GET    /api/events/               # Get all events
GET    /api/events/{id}           # Get single event
POST   /api/events/               # Create event (auth required)
PUT    /api/events/{id}           # Update event (auth required)
DELETE /api/events/{id}           # Delete event (auth required)
GET    /api/events/my-events       # Get user's events
```

## Booking Endpoints
```
GET    /api/bookings/            # Get user bookings
POST   /api/bookings/            # Create booking
PUT    /api/bookings/{id}        # Update booking
DELETE /api/bookings/{id}        # Cancel booking
```

## Review Endpoints
```
GET    /api/reviews/             # Get event reviews
POST   /api/reviews/             # Create review
PUT    /api/reviews/{id}         # Update review
DELETE /api/reviews/{id}         # Delete review
```

## Category Endpoints
```
GET    /api/categories/           # Get all categories
POST   /api/categories/           # Create category
PUT    /api/categories/{id}       # Update category
DELETE /api/categories/{id}       # Delete category
```

## Payment Endpoints
```
POST   /api/payments/process      # Process payment
GET    /api/payments/{id}        # Get payment details
GET    /api/payments/user        # Get user payment history
```

## Admin Endpoints
```
GET    /api/admin/users           # Get all users
PUT    /api/admin/users/{id}       # Update user
DELETE /api/admin/users/{id}       # Delete user
GET    /api/admin/events           # Admin event management
GET    /api/admin/analytics        # Platform analytics
```

## Health Check
```
GET    /api/health               # Service health status
GET    /                        # Root endpoint
```

## Response Format
All endpoints return JSON with consistent format:
```json
{
  "data": {...},
  "message": "Success",
  "status": 200
}
```

## Error Handling
```json
{
  "error": "Error message",
  "status": 400
}
```
