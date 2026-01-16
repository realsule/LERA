# 🚀 Quick Render Deployment Guide

## Your Repository is Ready! ✅

All deployment files are in place:
- ✅ `render.yaml` - Auto-configuration file
- ✅ `Procfile` - Gunicorn start command  
- ✅ `requirements.txt` - All dependencies
- ✅ Code is on `main` branch

## Deploy in 5 Minutes

### Step 1: Go to Render
👉 **https://render.com/dashboard**

### Step 2: Create Database (2 minutes)
1. Click **"New +"** → **"PostgreSQL"**
2. Name: `lera-db`
3. Click **"Create Database"**
4. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 3: Create Web Service (2 minutes)
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub: Select **`realsule/LERA`** repository
3. Configure:
   - **Name:** `lera-backend`
   - **Branch:** `main`
   - **Root Directory:** `backend` ⚠️ **CRITICAL: Must be `backend`**
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --bind 0.0.0.0:$PORT server.app:app`
4. Click **"Advanced"** → Add Environment Variables:
   - `DATABASE_URL` = (paste Internal Database URL from Step 2)
   - `SECRET_KEY` = (click "Generate" or use: `python -c "import secrets; print(secrets.token_hex(32))"`)
5. Click **"Create Web Service"**

### Step 4: Wait for Deployment
- Build takes 2-5 minutes
- Watch the logs in Render dashboard
- When you see "Your service is live", you're done!

### Step 5: Seed Database
1. In your service, click **"Shell"** tab
2. Run:
   ```bash
   cd backend
   python server/seed.py
   ```
3. Wait for "Database seeded!" message

### Step 6: Test Your API
Your API will be at: **`https://lera-backend.onrender.com`**

Test it:
```bash
curl https://lera-backend.onrender.com/api/health
# Should return: {"status": "healthy"}

curl https://lera-backend.onrender.com/api/events
# Should return list of events
```

## 🎯 Important Settings

**Root Directory:** Must be `backend` (not empty, not `/`, just `backend`)

**Environment Variables:**
- `DATABASE_URL` - Use Internal Database URL (not external)
- `SECRET_KEY` - Generate a secure random string

## ⚠️ Common Issues

**Build fails?**
- Check Root Directory is set to `backend`
- Verify branch is `main`
- Check build logs for errors

**Service won't start?**
- Verify Start Command: `gunicorn --bind 0.0.0.0:$PORT server.app:app`
- Check DATABASE_URL is set correctly
- Review logs in dashboard

**Database connection error?**
- Use Internal Database URL (starts with `postgresql://`)
- Ensure database and service are in same region

## 🎉 Success!

Once deployed, your API endpoints:
- `GET /api/health` - Health check
- `GET /api/events` - List all events
- `GET /api/categories` - List categories
- `POST /api/auth/login` - User login
- And more...

---

**Need help?** Check the full guide: `RENDER_DEPLOYMENT_STEPS.md`
