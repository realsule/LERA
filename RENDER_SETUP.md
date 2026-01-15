# Render Backend + Netlify Frontend Setup

## Quick Setup Guide

### 1. Update Backend URLs
Replace `your-backend-app.onrender.com` with your actual Render backend URL in:
- `netlify.toml` (line 11)
- `client/vite.config.js` (line 31)
- `client/.env.production` (line 2)
- `client/.env.development` (line 2)

### 2. Update Frontend URL
Replace `your-frontend-app.netlify.app` with your actual Netlify frontend URL in:
- `backend/server/app.py` (line 29)

### 3. Deploy to Render
```bash
# Push backend changes
git add .
git commit -m "Configure CORS for Render deployment"
git push origin main
```

### 4. Deploy to Netlify
```bash
# Deploy frontend
netlify deploy --prod --dir=client/dist
```

### 5. Test Connection
- Frontend: https://your-frontend-app.netlify.app
- Backend: https://your-backend-app.onrender.com
- Health Check: https://your-backend-app.onrender.com/api/health

## Environment Variables

### Backend (Render Dashboard)
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `FLASK_ENV`: production

### Frontend (Netlify Dashboard)
- `VITE_API_URL`: https://your-backend-app.onrender.com

## CORS Configuration
Backend is configured to accept requests from:
- Your Netlify frontend URL
- Local development (localhost:5173, localhost:8888)
- All required HTTP methods and headers

## API Endpoints
All endpoints are prefixed with `/api/`:
- Auth: `/api/auth/*`
- Events: `/api/events/*`
- Bookings: `/api/bookings/*`
- Reviews: `/api/reviews/*`
- Categories: `/api/categories/*`
- Payments: `/api/payments/*`
- Admin: `/api/admin/*`

## Troubleshooting

### CORS Errors
1. Verify frontend URL is added to CORS origins
2. Check that `VITE_API_URL` is correct
3. Ensure backend is deployed and accessible

### Network Errors
1. Check Render backend status
2. Verify environment variables
3. Test API endpoints directly

### Authentication Issues
1. Verify JWT tokens are being sent
2. Check `Authorization` header format
3. Ensure CORS allows `Authorization` header
