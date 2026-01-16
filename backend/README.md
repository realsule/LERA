# LERA Backend

## Overview
LERA backend is a RESTful API built with Flask framework for event management platform.

## Features
- User authentication and authorization
- Event creation and management
- Booking system with payment integration
- Review and rating system
- Admin dashboard functionality
- Comprehensive API documentation

## Technology Stack
- **Framework**: Flask 2.3.3
- **Database**: SQLAlchemy ORM
- **Authentication**: JWT tokens with Flask-Bcrypt
- **CORS**: Flask-CORS for cross-origin requests
- **Migrations**: Flask-Migrate for database versioning
- **Server**: Gunicorn (production)

## Quick Start

### Prerequisites
- Python 3.8+
- pip package manager
- Virtual environment

### Installation
```bash
# Clone repository
git clone <repository-url>
cd LERA/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python seed.py

# Start development server
python server/app.py
```

## Environment Variables
Create `.env` file in backend directory:
```env
DATABASE_URL=sqlite:///instance/lera.db
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FRONTEND_URL=http://localhost:5173
```

## API Documentation
- Base URL: `http://localhost:5555`
- Health check: `GET /api/health`
- Full API reference: See `API_ENDPOINTS.md`

## Project Structure
```
backend/
├── server/           # Flask application
│   ├── app.py      # Application factory
│   ├── config.py   # Configuration
│   └── __init__.py
├── models/           # Database models
├── routes/           # API endpoints
├── instance/         # Database files
├── venv/           # Virtual environment
└── requirements.txt  # Dependencies
```

## Development
```bash
# Run with auto-reload
python server/app.py

# Run tests
python -m pytest

# Database migrations
flask db init
flask db migrate -m "description"
flask db upgrade
```

## Deployment
See `DEPLOYMENT.md` for production deployment instructions.

## Contributing
See `CONTRIBUTING.md` for contribution guidelines.
