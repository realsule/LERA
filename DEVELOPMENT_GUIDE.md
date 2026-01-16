# Development Guide

## Setup Instructions

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server/app.py
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///instance/lera.db
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
```

### Frontend (.env.development)
```
VITE_API_URL=http://localhost:5555
```

## Database Management

### Initialize Database
```bash
cd backend
source venv/bin/activate
python seed.py
```

### Create Migrations
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Testing

### Backend Tests
```bash
cd backend
source venv/bin/activate
python -m pytest tests/
```

### Frontend Tests
```bash
cd client
npm test
```

## Common Issues & Solutions

### CORS Issues
- Ensure frontend URL is in CORS origins
- Check environment variables

### Database Connection
- Verify DATABASE_URL is correct
- Check if instance directory exists

### Import Errors
- Activate virtual environment
- Install requirements.txt dependencies

## Deployment

### Backend (Render)
1. Connect repository to Render
2. Set environment variables
3. Deploy automatically

### Frontend (Netlify)
1. Connect repository to Netlify
2. Configure build settings
3. Deploy automatically

## Code Quality

### Linting
```bash
# Backend
flake8 backend/
black backend/

# Frontend
npm run lint
```

### Pre-commit Hooks
```bash
pip install pre-commit
pre-commit install
```
