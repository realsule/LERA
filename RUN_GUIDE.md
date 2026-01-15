# LERA Application Run Guide

This guide provides step-by-step instructions to run the LERA full-stack application and verify database connectivity.

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ and npm installed
- Git installed

## Project Structure

```
LERA/
├── backend/          # Flask backend application
│   ├── server/      # Flask app and configuration
│   ├── models/      # Database models
│   ├── routes/       # API route handlers
│   ├── instance/    # SQLite database location
│   └── seed_check.py # Database seeding script
└── client/          # React frontend application
    ├── src/         # React source code
    └── vite.config.js # Vite proxy configuration
```

## Step 1: Install Dependencies

### Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Frontend Dependencies

```bash
cd client
npm install --legacy-peer-deps
```

**Note:** The `--legacy-peer-deps` flag is required due to React 19 compatibility with some packages.

## Step 2: Seed the Database

Before running the application, populate the database with test data:

```bash
cd backend
python seed_check.py
```

This script will create:
- 1 test user: `test_organizer` (password: `testpass123`)
- 3 test events: Summer Music Festival, Tech Innovation Summit, Marathon Championship
- Required categories: concert, conference, sports, workshop, party

**Expected Output:**
```
✅ Database tables created/verified
👤 Creating test user...
✅ Created test user: test_organizer (ID: 1)
📁 Creating categories...
✅ Categories ready
🎉 Creating test events...
✅ Created event: Summer Music Festival 2024
✅ Created event: Tech Innovation Summit
✅ Created event: Marathon Championship
```

## Step 3: Start the Backend Server

Open a terminal and run:

```bash
cd backend/server
python app.py
```

**Expected Output:**
```
✅ Database tables created/verified
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

The backend server will run on **http://127.0.0.1:5000**

### Verify Backend is Running

Test the backend health endpoint:

```bash
curl http://127.0.0.1:5000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy"
}
```

## Step 4: Start the Frontend Development Server

Open a **new terminal** and run:

```bash
cd client
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

The frontend will run on **http://localhost:5173**

## Step 5: Verify Database Connection

### Method 1: Check System Status Badge

1. Open http://localhost:5173 in your browser
2. Scroll to the bottom of the page
3. Look for the **System Status** badge in the footer
4. The badge should show **"Online"** (green) if the backend is connected

### Method 2: Check Browser Console

1. Open http://localhost:5173 in your browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Look for: `✅ Backend Health Status: {status: "healthy"}`

### Method 3: Verify Events are Loading

1. Navigate to the home page (http://localhost:5173)
2. You should see 3 test events displayed:
   - Summer Music Festival 2024
   - Tech Innovation Summit
   - Marathon Championship
3. If events are loading, the database connection is working correctly

### Method 4: Test API Directly

Test the events API endpoint through the proxy:

```bash
curl http://localhost:5173/api/events
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "title": "Summer Music Festival 2024",
    "description": "Experience the best of live music...",
    "date": "2024-02-15T00:00:00",
    "location": "Central Park Arena, New York, NY",
    "price": 75.0,
    "capacity": 5000,
    ...
  },
  ...
]
```

## Quick Start Commands (All-in-One)

For convenience, you can run both servers in separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend/server && python app.py
```

**Terminal 2 - Frontend:**
```bash
cd client && npm run dev
```

## Troubleshooting

### Backend Won't Start

1. **Check if port 5000 is already in use:**
   ```bash
   lsof -i :5000
   ```
   If another process is using port 5000, kill it or change the port in `backend/server/app.py`

2. **Verify database exists:**
   ```bash
   ls -la backend/instance/lera.db
   ```
   If the database doesn't exist, run `python seed_check.py` again

3. **Check Python dependencies:**
   ```bash
   pip list | grep Flask
   ```

### Frontend Won't Connect to Backend

1. **Verify backend is running:**
   ```bash
   curl http://127.0.0.1:5000/api/health
   ```

2. **Check Vite proxy configuration:**
   - Open `client/vite.config.js`
   - Verify proxy target is `http://127.0.0.1:5000`

3. **Check browser console for CORS errors:**
   - If you see CORS errors, verify `CORS(app)` is enabled in `backend/server/app.py`

### No Events Displayed

1. **Verify database has data:**
   ```bash
   cd backend
   python -c "from server.app import create_app; from models import Event; app = create_app(); app.app_context().push(); print(f'Events in DB: {Event.query.count()}')"
   ```

2. **Re-seed the database:**
   ```bash
   cd backend
   python seed_check.py
   ```

3. **Check browser console for API errors:**
   - Open Developer Tools (F12) > Console
   - Look for error messages related to API calls

### System Status Badge Shows "Offline"

1. **Verify backend is running** (see Backend Won't Start section)
2. **Check network connectivity:**
   ```bash
   curl http://localhost:5173/api/health
   ```
3. **Wait 30 seconds** - the badge checks health every 30 seconds

## Database Location

The SQLite database is located at:
```
backend/instance/lera.db
```

## API Endpoints

All API endpoints are prefixed with `/api`:

- `GET /api/health` - Health check
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the `backend` directory if needed:

```env
DATABASE_URL=sqlite:///instance/lera.db
SECRET_KEY=your-secret-key-here
```

## Production Deployment

For production deployment:

1. Set `DATABASE_URL` to your production database
2. Set a secure `SECRET_KEY`
3. Configure CORS to allow your frontend domain
4. Build the frontend: `cd client && npm run build`
5. Serve the frontend build with a production server (e.g., Nginx)

## Support

For issues or questions:
- Check the browser console for errors
- Check backend terminal for error messages
- Verify all dependencies are installed correctly
- Ensure both servers are running simultaneously

---

**Last Updated:** January 2024
**Version:** 1.0.0
