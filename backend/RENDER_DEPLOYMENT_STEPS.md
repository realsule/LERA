# 🚀 Render Deployment Steps - LERA Backend

## ✅ Pre-Deployment Checklist

All deployment files are ready:
- ✅ `render.yaml` - Render configuration
- ✅ `Procfile` - Gunicorn start command
- ✅ `requirements.txt` - All dependencies including gunicorn
- ✅ `server/app.py` - Configured for production (reads PORT from env)
- ✅ `server/config.py` - Database configuration with fallbacks

## 📋 Step-by-Step Deployment Instructions

### Step 1: Create PostgreSQL Database (Recommended)

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `lera-database` (or your preferred name)
   - **Database:** `lera` (or leave default)
   - **User:** (auto-generated)
   - **Region:** Choose closest to you
   - **Plan:** Free tier is fine for development
4. Click **"Create Database"**
5. **IMPORTANT:** Copy the **Internal Database URL** (starts with `postgresql://`)
   - You'll need this in Step 3

### Step 2: Create Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect account"** if not already connected
   - Select repository: **`realsule/LERA`** (or your repo name)
   - Click **"Connect"**
3. Configure the service:
   - **Name:** `lera-backend` (or your preferred name)
   - **Environment:** `Python 3`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend` ⚠️ **IMPORTANT: Set this to `backend`**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --bind 0.0.0.0:$PORT server.app:app`
   - **Plan:** Free tier is fine for development

### Step 3: Set Environment Variables

In the Web Service settings, go to **"Environment"** tab and add:

1. **DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: Paste the Internal Database URL from Step 1
   - Example: `postgresql://user:password@dpg-xxxxx-a/lera`

2. **SECRET_KEY**
   - Key: `SECRET_KEY`
   - Value: Generate a secure random key
   - You can generate one using:
     ```bash
     python -c "import secrets; print(secrets.token_hex(32))"
     ```
   - Or use Render's "Generate" button if available

3. **FRONTEND_URL** (Optional, for CORS)
   - Key: `FRONTEND_URL`
   - Value: Your frontend URL (e.g., `https://your-frontend.onrender.com`)
   - Leave empty if you don't have a frontend deployed yet

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies from `requirements.txt`
   - Start the service with gunicorn
3. Wait for deployment to complete (usually 2-5 minutes)
4. Your API will be available at: `https://lera-backend.onrender.com`

### Step 5: Verify Deployment

1. **Health Check:**
   ```bash
   curl https://lera-backend.onrender.com/api/health
   ```
   Should return: `{"status": "healthy"}`

2. **API Root:**
   ```bash
   curl https://lera-backend.onrender.com/
   ```
   Should return: `{"message": "LERA API is running"}`

3. **Test Events Endpoint:**
   ```bash
   curl https://lera-backend.onrender.com/api/events
   ```
   Should return a JSON array (may be empty if database not seeded)

### Step 6: Seed the Database

After deployment, you need to populate the database:

**Option A: Using Render Shell (Recommended)**
1. In your Web Service dashboard, click **"Shell"** tab
2. Run:
   ```bash
   cd backend
   python server/seed.py
   ```
3. Wait for "Database seeded!" message

**Option B: Using Render SSH**
1. In your Web Service dashboard, click **"SSH"** tab
2. Connect and run:
   ```bash
   cd backend
   python server/seed.py
   ```

### Step 7: Update Frontend (If Applicable)

If you have a frontend, update its `.env` file:
```env
VITE_API_URL=https://lera-backend.onrender.com
```

## 🔧 Troubleshooting

### Build Fails
- Check that `Root Directory` is set to `backend`
- Verify `requirements.txt` has all dependencies
- Check build logs in Render dashboard

### Service Won't Start
- Verify `Start Command` is correct: `gunicorn --bind 0.0.0.0:$PORT server.app:app`
- Check that `DATABASE_URL` is set correctly
- Review logs in Render dashboard

### Database Connection Issues
- Verify `DATABASE_URL` uses the **Internal Database URL** (not external)
- Check that database is in the same region as web service
- Ensure database is not paused (free tier pauses after inactivity)

### CORS Issues
- Set `FRONTEND_URL` environment variable
- Or update `server/app.py` to allow your frontend domain

## 📝 Quick Reference

**Service URL:** `https://lera-backend.onrender.com`  
**Health Check:** `https://lera-backend.onrender.com/api/health`  
**API Base:** `https://lera-backend.onrender.com/api`

## 🎉 Success!

Once deployed, your API endpoints will be:
- `GET /api/health` - Health check
- `GET /api/events` - List events
- `GET /api/categories` - List categories
- `POST /api/auth/login` - User login
- And more...
