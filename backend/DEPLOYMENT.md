# Backend Deployment Guide

## Production Deployment (Render)

### Prerequisites
- Render account
- GitHub repository connected
- Environment variables configured

### Setup Steps

1. **Connect Repository**
   - Go to Render Dashboard
   - Click "New +"
   - Select "Web Service"
   - Connect GitHub repository
   - Choose `LERA` repository

2. **Configure Service**
   ```yaml
   # render.yaml
   services:
     - type: web
       name: lera-backend
       env: python
       buildCommand: pip install -r requirements.txt
       startCommand: python server/app.py
       envVars:
         - key: DATABASE_URL
           value: ${DATABASE_URL}
         - key: SECRET_KEY
           value: ${SECRET_KEY}
         - key: FLASK_ENV
           value: production
   ```

3. **Environment Variables**
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   SECRET_KEY=your-production-secret-key
   FLASK_ENV=production
   FRONTEND_URL=https://your-frontend-domain.com
   ```

4. **Deploy**
   - Commit and push changes
   - Render auto-deploys on push
   - Monitor deployment logs

## Database Setup

### PostgreSQL on Render
1. Create PostgreSQL service on Render
2. Get connection string
3. Add to environment variables
4. Run migrations: `flask db upgrade`

### Local Development
```bash
# Use local SQLite
DATABASE_URL=sqlite:///instance/lera.db

# Use remote PostgreSQL
DATABASE_URL=postgresql://user:pass@host:port/db
```

## Monitoring & Logging

### Health Checks
- Health endpoint: `/api/health`
- Monitor response times
- Set up alerting

### Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)
```

## Security Considerations

### Production Security
- Use HTTPS everywhere
- Set secure cookies
- Implement rate limiting
- Monitor for attacks
- Regular security updates

### Environment Security
- Never commit secrets
- Use Render environment variables
- Rotate secrets regularly
- Audit access logs

## Performance Optimization

### Database
- Add database indexes
- Use connection pooling
- Optimize queries
- Implement caching

### Application
- Enable gzip compression
- Use CDN for static files
- Implement caching headers
- Monitor performance metrics

## Troubleshooting

### Common Issues
1. **Database Connection**
   - Check DATABASE_URL format
   - Verify network connectivity
   - Review firewall settings

2. **Import Errors**
   - Activate virtual environment
   - Install requirements.txt
   - Check Python version

3. **CORS Issues**
   - Verify FRONTEND_URL
   - Check CORS configuration
   - Review allowed origins

### Debug Mode
```python
# Enable debug in development
app.run(debug=True)

# Disable in production
app.run(debug=False)
```

## Scaling

### Horizontal Scaling
- Use load balancer
- Multiple app instances
- Database read replicas
- Caching layer

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement async processing

## Backup & Recovery

### Database Backups
- Automated daily backups
- Point-in-time recovery
- Test restore procedures
- Geographic distribution

### Application Backups
- Version control tags
- Configuration backups
- Asset versioning
- Disaster recovery plan
