# Deploying to Render

## Setup Instructions

1. **Create a new Web Service on Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` branch

2. **Configure the service:**
   - **Name:** lera-backend (or your preferred name)
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --bind 0.0.0.0:$PORT server.app:app`
   - **Root Directory:** `backend` (if your repo root is LERA)

3. **Set Environment Variables:**
   - `DATABASE_URL`: Create a PostgreSQL database on Render and use its connection string
     - Or use: `sqlite:///lera.db` for SQLite (not recommended for production)
   - `SECRET_KEY`: Generate a secure random key (you can use: `python -c "import secrets; print(secrets.token_hex(32))"`)

4. **After deployment:**
   - Your API will be available at: `https://your-service-name.onrender.com`
   - Test the health endpoint: `https://your-service-name.onrender.com/api/health`
   - Run the seed script to populate the database (if using SQLite, you'll need to do this via Render's shell)

## Database Setup

### Option 1: PostgreSQL (Recommended for Production)
1. Create a new PostgreSQL database on Render
2. Copy the Internal Database URL
3. Set it as `DATABASE_URL` environment variable
4. The app will automatically create tables on first run

### Option 2: SQLite (Development Only)
- Set `DATABASE_URL` to `sqlite:///lera.db`
- Note: SQLite files are ephemeral on Render and will be lost on redeploy

## Seeding the Database

After deployment, you can seed the database by:
1. Using Render's Shell: `cd backend && python server/seed.py`
2. Or via API endpoints if you create an admin seeding endpoint

## Update Frontend

After deploying, update your frontend `.env` file:
```
VITE_API_URL=https://your-service-name.onrender.com
```
