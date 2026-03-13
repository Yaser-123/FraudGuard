# 🚀 Deployment Guide - Secure Complaint Form System

This guide covers deploying your complaint form system with enterprise-grade security to production.

## 📋 Pre-Deployment Checklist

### 1. Security Configuration
- [ ] Generate new JWT secret (64+ characters)
- [ ] Create strong admin password (12+ characters)
- [ ] Update CORS origins to production domains
- [ ] Set NODE_ENV=production
- [ ] Configure HTTPS certificates
- [ ] Set up monitoring and logging

### 2. Database Setup
- [ ] Neon.tech PostgreSQL database configured
- [ ] Database URL updated in .env
- [ ] Database migrations applied
- [ ] Database backups configured

### 3. Environment Variables
```env
# Production Environment
NODE_ENV=production
PORT=3001

# Database (Neon.tech)
DATABASE_URL=postgresql://username:password@host.neon.tech/database?sslmode=require

# Security
JWT_SECRET=your-production-jwt-secret-64-chars-minimum
ADMIN_PASSWORD_HASH=your-production-bcrypt-hash

# CORS (Your actual domains)
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

## 🏗 Deployment Options

### Option 1: Docker Deployment

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "start"]
```

2. **Create docker-compose.yml**:
```yaml
version: '3.8'
services:
  complaint-app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped
    volumes:
      - ./uploads:/app/uploads
```

3. **Deploy**:
```bash
docker-compose up -d
```

### Option 2: Cloud Platform Deployment

#### Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set ADMIN_PASSWORD_HASH=your-password-hash
heroku config:set DATABASE_URL=your-neon-db-url
git push heroku main
```

#### Vercel (Frontend + Serverless Functions)
```bash
npm install -g vercel
vercel --prod
```

#### Railway
```bash
railway login
railway new
railway add
railway deploy
```

## 🔒 Production Security Setup

### 1. Generate Production Secrets
```bash
# Generate new admin password
node generate-admin-password.js

# Set environment variables
export JWT_SECRET="your-64-char-secret"
export ADMIN_PASSWORD_HASH="your-bcrypt-hash"
export NODE_ENV="production"
```

### 2. SSL/TLS Configuration
```javascript
// Add to server.js for HTTPS
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
```

### 3. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private-key.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring and Logging

### 1. Application Monitoring
```javascript
// Add to server.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log security events
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});
```

### 2. Health Checks
```javascript
// Enhanced health check
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await db.select().from(schema.complaints).limit(1);
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'disconnected',
      error: error.message
    });
  }
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to production
      run: |
        # Your deployment commands here
        echo "Deploying to production..."
```

## 🚨 Security Checklist

### Pre-Production
- [ ] All default passwords changed
- [ ] JWT secrets are 64+ characters
- [ ] HTTPS enabled everywhere
- [ ] Rate limiting configured
- [ ] Input validation active
- [ ] Security headers set
- [ ] CORS properly configured
- [ ] Error handling doesn't leak info
- [ ] Logs don't contain sensitive data

### Post-Production
- [ ] Security scanning (OWASP ZAP, etc.)
- [ ] Penetration testing
- [ ] Performance testing
- [ ] Load testing
- [ ] Backup procedures tested
- [ ] Disaster recovery plan
- [ ] Security incident response plan

## 📈 Performance Optimization

### 1. Caching
```javascript
import redis from 'redis';
const client = redis.createClient();

// Cache complaints for admin dashboard
app.get('/api/complaints', verifyAdminToken, async (req, res) => {
  const cacheKey = 'complaints:all';
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const complaints = await db.select().from(schema.complaints);
  await client.setex(cacheKey, 300, JSON.stringify(complaints)); // 5 min cache
  
  res.json({ success: true, data: complaints });
});
```

### 2. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_complaints_status ON complaints(call_dispatch_success);
```

## 🔧 Maintenance

### Regular Tasks
- Update dependencies monthly
- Rotate JWT secrets quarterly
- Review and update admin passwords
- Monitor security logs
- Update SSL certificates
- Database maintenance and backups

### Monitoring Alerts
- High error rates
- Failed authentication attempts
- Unusual traffic patterns
- Database connection issues
- High memory/CPU usage

## 📞 Support and Troubleshooting

### Common Issues
1. **Admin can't login**: Check password hash and JWT secret
2. **CORS errors**: Verify allowed origins in production
3. **Database connection**: Check DATABASE_URL and network
4. **Rate limiting**: Monitor IP addresses hitting limits

### Debug Commands
```bash
# Check server logs
tail -f combined.log

# Test database connection
node -e "import('./db/db.js').then(({db}) => db.select().from(schema.complaints).limit(1))"

# Verify JWT secret
node -e "console.log(process.env.JWT_SECRET?.length)"
```

---

**🎉 Congratulations!** Your complaint form system is now ready for production with enterprise-grade security!
