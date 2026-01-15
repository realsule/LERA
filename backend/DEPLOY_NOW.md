# 🚀 Deploy Backend to Render - Step by Step

## ✅ Your Code is Ready!

All files are committed and ready for deployment.

## 📋 Deployment Steps

### Step 1: Go to Render Dashboard
👉 **https://render.com/dashboard**

### Step 2: Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `lera-database`
   - **Database:** `lera`
   - **Region:** Choose closest to you
   - **Plan:** Free (for development)
3. Click **"Create Database"**
4. ⚠️ **IMPORTANT:** Copy the **Internal Database URL**
   - It looks like: `postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/lera`
   - You'll need this in Step 4

### Step 3: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. **Connect GitHub:**
   - If not connected, click "Connect account"
   - Select repository: **`realsule/LERA`**
   - Click **"Connect"**
3. **Configure Service:**
   - **Name:** `lera-backend`
   - **Environment:** `Python 3`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend` ⚠️ **CRITICAL: Must be `backend`**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --bind 0.0.0.0:$PORT server.app:app`
   - **Plan:** Free (for development)

### Step 4: Set Environment Variables

In the **"Environment"** section, add:

1. **DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: Paste the **Internal Database URL** from Step 2

2. **SECRET_KEY**
   - Key: `SECRET_KEY`
   - Value: Generate using:
     ```bash
     python -c "import secrets; print(secrets.token_hex(32))"
     ```
   - Or click "Generate" if available

3. **FRONTEND_URL** (Optional)
   - Key: `FRONTEND_URL`
   - Value: Your frontend URL (if you have one)

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 2-5 minutes for build and deployment
3. Watch the logs - you'll see:
   - Installing dependencies
   - Building...
   - Starting service
   - ✅ "Your service is live at https://lera-backend.onrender.com"

### Step 6: Seed the Database (IMPORTANT!)

After deployment succeeds:

1. In your service dashboard, click **"Shell"** tab
2. Run:
   ```bash
   cd backend
   python server/seed.py
   ```
3. Wait for: `✅ Database successfully recreated and seeded!`

### Step 7: Test Your API

Your backend will be at: **`https://lera-backend.onrender.com`**

Test endpoints:
```bash
# Health check
curl https://lera-backend.onrender.com/api/health

# Get events (should show 8 events after seeding)
curl https://lera-backend.onrender.com/api/events

# Get categories (should show 8 categories)
curl https://lera-backend.onrender.com/api/categories
```

Or open in browser:
- https://lera-backend.onrender.com/api/health
- https://lera-backend.onrender.com/api/events
- https://lera-backend.onrender.com/api/categories

## 🎯 Quick Checklist

- [ ] Created PostgreSQL database
- [ ] Copied Internal Database URL
- [ ] Created Web Service
- [ ] Set Root Directory to `backend`
- [ ] Set DATABASE_URL environment variable
- [ ] Set SECRET_KEY environment variable
- [ ] Deployed successfully
- [ ] Seeded database via Shell
- [ ] Tested API endpoints

## ⚠️ Common Issues

**"Build failed"**
- Check Root Directory is `backend` (not empty)
- Verify branch is `main`
- Check build logs for errors

**"Service won't start"**
- Verify Start Command: `gunicorn --bind 0.0.0.0:$PORT server.app:app`
- Check DATABASE_URL is correct (Internal URL, not External)
- Review logs in dashboard

**"No data showing"**
- Make sure you ran `python server/seed.py` in Shell
- Check database connection in logs
- Verify DATABASE_URL uses Internal URL

## 🎉 Success!

Once deployed and seeded, you'll have:
- 6 users (admin, organizers, regular users)
- 8 categories
- 8 events
- 7 bookings
- 5 reviews

All accessible via your Render URL!
