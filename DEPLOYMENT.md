# 🚀 Digital Library - Production Deployment Guide

## 📋 Overview

This guide covers production deployment options for the Digital Library application, including Docker, PM2, and cloud deployment strategies.

## 🛠️ Prerequisites

- Node.js 18+ 
- MongoDB 7.0+
- Docker & Docker Compose (for containerized deployment)
- PM2 (for process management)
- Nginx (for reverse proxy)

## 🔧 Environment Configuration

### 1. Environment Files

Copy and configure environment files:

```bash
# Development
cp .env.development .env

# Production
cp .env.production .env
```

### 2. Required Environment Variables

**Critical Production Variables:**
```bash
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/digital_library_prod
JWT_SECRET=your-super-secure-jwt-secret-key-for-production
CORS_ORIGIN=https://your-production-domain.com
BCRYPT_ROUNDS=12
```

## 🐳 Docker Deployment (Recommended)

### Quick Start

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production with Nginx

```bash
# Start with nginx reverse proxy
docker-compose --profile production up -d
```

### Docker Commands

```bash
# Build only the app
docker build -t digital-library .

# Run standalone container
docker run -d \
  --name digital-library-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/digital_library \
  digital-library
```

## ⚡ PM2 Deployment

### Installation

```bash
npm install -g pm2
```

### Deployment Commands

```bash
# Install dependencies
npm install

# Build frontend
npm run build:prod

# Start with PM2
npm run pm2:start

# Monitor
npm run pm2:logs

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop
```

### PM2 Ecosystem Configuration

The `ecosystem.config.js` file includes:
- Cluster mode for multi-core utilization
- Auto-restart on crashes
- Memory limit monitoring
- Health checks
- Log rotation

## 🌐 Manual Deployment

### 1. Install Dependencies

```bash
npm ci --only=production
```

### 2. Build Frontend

```bash
npm run build:prod
```

### 3. Start Server

```bash
# Development
npm run start:dev

# Production
npm run start
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup

```bash
# Generate self-signed certificate (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem

# For production, use Let's Encrypt or commercial certificates
```

### 2. Firewall Configuration

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. MongoDB Security

```bash
# Enable authentication
mongo
> use admin
> db.createUser({
    user: "admin",
    pwd: "secure_password",
    roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase"]
  })
```

## 📊 Monitoring & Logging

### 1. Health Checks

```bash
# Application health
curl http://localhost:3000/api/health

# Automated health check
npm run health-check
```

### 2. Log Management

```bash
# View application logs
tail -f logs/production.log

# PM2 logs
pm2 logs

# Docker logs
docker-compose logs -f app
```

### 3. Performance Monitoring

```bash
# PM2 monitoring
pm2 monit

# System metrics endpoint
curl http://localhost:3000/api/metrics
```

## ☁️ Cloud Deployment

### AWS EC2

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Deploy application
git clone <your-repo>
cd digital-library
npm install
npm run build:prod
npm run pm2:start
```

### DigitalOcean Droplet

```bash
# One-click MongoDB droplet or manual installation
# Follow AWS EC2 steps above
```

### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build:prod
      
      - name: Deploy to server
        run: |
          # Add your deployment script here
          scp -r dist/ user@server:/path/to/app/
          ssh user@server 'pm2 restart ecosystem.config.js'
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **MongoDB connection failed**
   ```bash
   sudo systemctl status mongod
   sudo systemctl start mongod
   ```

3. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER /path/to/app
   chmod +x server.js
   ```

4. **Memory issues**
   ```bash
   # Increase Node.js memory limit
   node --max-old-space-size=4096 server.js
   ```

### Performance Optimization

1. **Enable compression**
   - Already configured in production mode

2. **Database indexing**
   ```javascript
   // Add to MongoDB
   db.books.createIndex({ title: "text", author: "text" })
   db.users.createIndex({ email: 1 }, { unique: true })
   ```

3. **Caching**
   - Redis integration (optional)
   - Static file caching via Nginx

## 📈 Scaling

### Horizontal Scaling

```bash
# PM2 cluster mode (already configured)
pm2 start ecosystem.config.js

# Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml digital-library

# Kubernetes
kubectl apply -f k8s/
```

### Database Scaling

- MongoDB replica sets
- Read replicas
- Sharding for large datasets

## 🔐 Backup Strategy

### Database Backup

```bash
# MongoDB backup
mongodump --db digital_library --out /backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
mongodump --db digital_library --out $BACKUP_DIR
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

# Keep only last 7 days
find /backup -name "*.tar.gz" -mtime +7 -delete
```

### Application Backup

```bash
# Code backup (use Git)
git push origin main

# Files backup
tar -czf app_backup_$(date +%Y%m%d).tar.gz /path/to/app
```

## 📞 Support

For deployment issues:
1. Check logs: `npm run pm2:logs` or `docker-compose logs`
2. Verify environment variables
3. Test database connectivity
4. Check firewall settings
5. Review Nginx configuration

---

**🎉 Your Digital Library is now ready for production!**