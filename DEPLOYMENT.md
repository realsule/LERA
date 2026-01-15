# LERA Deployment Guide

## Backend Deployment to Render

### Prerequisites
- GitHub repository connected to Render
- Render account (free tier available)

### Steps

1. **Create a Web Service on Render:**
   - Go to https://render.com/dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` branch
   - Set Root Directory to `backend` (if repo root is LERA)

2. **Configure Build Settings:**
   - **Name:** lera-backend
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --bind 0.0.0.0:$PORT server.app:app`

3. **Set Environment Variables:**
   ```
   DATABASE_URL=postgresql://... (from Render PostgreSQL database)
   SECRET_KEY=<generate-a-secure-random-key>
   FRONTEND_URL=https://your-frontend-url.com (optional, for CORS)
   ```

4. **Create PostgreSQL Database (Recommended):**
   - In Render dashboard, create a new PostgreSQL database
   - Copy the Internal Database URL
   - Set it as `DATABASE_URL` environment variable

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Your API will be at: `https://lera-backend.onrender.com`

6. **Seed the Database:**
   - Use Render's Shell: `cd backend && python server/seed.py`
   - Or access via SSH and run the seed script

## Frontend Configuration

### Local Development

1. **Create `.env` file in frontend directory:**
   ```env
   VITE_API_URL=http://localhost:5555
   ```

2. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

### Production (After Backend Deployment)

1. **Update `.env` file:**
   ```env
   VITE_API_URL=https://lera-backend.onrender.com
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Deploy frontend:**
   - Deploy the `dist` folder to Vercel, Netlify, or any static hosting
   - Or deploy as a separate Render service

## Testing the Connection

### Backend Health Check
```bash
curl https://lera-backend.onrender.com/api/health
```

### Frontend Connection
- Open your frontend app
- It should display events and categories from the backend
- Check browser console for any API errors

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/events` - List all events
- `GET /api/categories` - List all categories
- `POST /api/auth/login` - User login
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `POST /api/reviews` - Create review
- And more...

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` is set correctly in backend environment variables
- Check that CORS origins include your frontend URL

### Database Issues
- Verify `DATABASE_URL` is set correctly
- Check database connection in Render logs
- Ensure tables are created (run seed script)

### API Connection Issues
- Verify backend is deployed and running
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for CORS or network errors
