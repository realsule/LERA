# LERA Event Management System

A full-stack event management platform built with React (frontend) and Flask (backend).

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- Git

### One-Command Startup

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Start both frontend and backend servers
npm run dev
```

This will start:
- Frontend: http://localhost:5173 (React + Vite)
- Backend: http://localhost:5000 (Flask API)

## Project Structure

```
LERA/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── App.jsx        # Main App component
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── backend/               # Flask backend
│   ├── server/           # Flask app configuration
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── instance/         # SQLite database
│   └── requirements.txt  # Python dependencies
├── package.json          # Root scripts and dependencies
└── README.md            # This file
```

## Development

### Frontend Development
```bash
cd client
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run test         # Run tests
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python server/app.py  # Start Flask server
```

### Database
- Uses SQLite for local development
- Database file: `backend/instance/lera.db`
- Auto-initializes tables on server start

## API Connection

The frontend automatically connects to the backend through:
- Vite proxy configuration (development)
- Relative API paths (`/api/*`)
- CORS enabled on Flask backend

## Environment Variables

Backend (create `.env` in `backend/`):
```
DATABASE_URL=sqlite:///instance/lera.db
SECRET_KEY=your-secret-key
```

## Features

- ✅ User authentication & authorization
- ✅ Event creation & management
- ✅ Booking system
- ✅ Review & rating system
- ✅ Role-based access control
- ✅ Responsive design with Tailwind CSS

## Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- React Router
- Axios

**Backend:**
- Flask
- SQLAlchemy
- Flask-CORS
- SQLite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
