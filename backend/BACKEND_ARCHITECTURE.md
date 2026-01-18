# Backend Architecture Documentation

## Overview
LERA backend is built using Flask framework with SQLAlchemy ORM for database management.

## Project Structure
```
backend/
├── server/
│   ├── app.py              # Flask application factory
│   ├── config.py           # Configuration management
│   └── __init__.py
├── models/                 # Database models
│   ├── user.py
│   ├── event.py
│   ├── booking.py
│   ├── category.py
│   └── review.py
├── routes/                 # API endpoints
│   ├── auth.py
│   ├── events.py
│   ├── bookings.py
│   ├── reviews.py
│   ├── categories.py
│   ├── payments.py
│   └── admin.py
├── instance/               # Database files
├── venv/                  # Virtual environment
└── requirements.txt        # Dependencies
```

## API Endpoints
- `/api/auth/*` - Authentication endpoints
- `/api/events/*` - Event management
- `/api/bookings/*` - Booking system
- `/api/reviews/*` - Review system
- `/api/categories/*` - Category management
- `/api/payments/*` - Payment processing
- `/api/admin/*` - Admin functions

## Database Schema
- Users table with authentication
- Events table with relationships
- Bookings table linking users and events
- Reviews table for event feedback
- Categories table for event classification

## Technology Stack
- **Framework**: Flask
- **Database**: SQLAlchemy ORM
- **Authentication**: Flask-Bcrypt
- **CORS**: Flask-CORS
- **Migrations**: Flask-Migrate
- **Server**: Gunicorn (production)
