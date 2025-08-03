# Security & Performance Guide

## 📋 Tổng quan

Hệ thống Digital Library đã được tích hợp các tính năng bảo mật và hiệu suất nâng cao để đảm bảo:

- **Bảo mật**: Xác thực mạnh mẽ, mã hóa dữ liệu, kiểm soát truy cập
- **Hiệu suất**: Caching Redis, tối ưu database, giám sát real-time
- **Giám sát**: Logging chi tiết, metrics, health checks
- **Tuân thủ**: Best practices cho healthcare/pharmacy domain

## 🔒 Tính năng Bảo mật

### 1. Authentication & Authorization

```javascript
// JWT với secret mạnh
JWT_SECRET=your-super-strong-secret-key-32-chars-min
JWT_EXPIRES_IN=7d

// Bcrypt với rounds cao
BCRYPT_ROUNDS=12
```

### 2. Rate Limiting

- **General API**: 100 requests/15 phút
- **Authentication**: 5 requests/15 phút
- **Search**: 50 requests/15 phút
- **Upload**: 10 requests/15 phút

### 3. Security Headers

```javascript
// Helmet configuration
- Content Security Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
```

### 4. Input Validation & Sanitization

```javascript
// Tự động sanitize tất cả requests
- HTML entities encoding
- NoSQL injection prevention
- XSS protection
```

## ⚡ Tính năng Hiệu suất

### 1. Redis Caching

```javascript
// Cache configuration
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=3600

// Cache strategies
- Books: 1 hour TTL
- Users: 30 minutes TTL
- Search results: 15 minutes TTL
- Statistics: 5 minutes TTL
```

### 2. Database Optimization

```javascript
// Recommended indexes
Books: title (text), author, category, isbn
Users: email, username, role
BorrowRecords: userId, bookId, status, borrowDate
```

### 3. Performance Monitoring

```javascript
// Metrics collection
- Response times
- Memory usage
- CPU utilization
- Database performance
- Cache hit rates
```

## 🛠️ Setup & Configuration

### 1. Environment Variables

```bash
# Copy và cấu hình environment
cp .env.example .env.production

# Cấu hình Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Cấu hình Security
JWT_SECRET=your-super-strong-secret-key-minimum-32-characters
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://yourdomain.com

# Cấu hình Monitoring
MONITORING_ENABLED=true
METRICS_ENABLED=true
HEALTH_CHECK_ENABLED=true
```

### 2. Redis Setup

```bash
# Setup Redis server
npm run redis:setup

# Setup với config file
npm run redis:setup:config

# Clear cache
npm run redis:clear
```

### 3. Database Optimization

```bash
# Analyze và tạo indexes
npm run db:optimize

# Full optimization (bao gồm compact)
npm run db:optimize:full
```

### 4. Security Audit

```bash
# Chạy security audit
npm run security:audit

# Kết quả sẽ tạo:
# - security-audit-report.json
# - security-audit-report.md
```

## 📊 Monitoring & Logging

### 1. Health Checks

```bash
# Check application health
curl http://localhost:3000/api/health

# Response format:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "services": {
    "database": "connected",
    "cache": "connected",
    "filesystem": "accessible"
  },
  "metrics": {
    "memory": { "used": 150, "total": 1024 },
    "cpu": { "usage": 25 }
  }
}
```

### 2. Metrics Endpoint

```bash
# Get performance metrics
curl http://localhost:3000/api/metrics

# Response includes:
- Request counts
- Response times
- Error rates
- System resources
- Cache statistics
```

### 3. Logging System

```bash
# View security logs
npm run logs:security

# View performance logs
npm run logs:performance

# Log files location:
logs/
├── application.log
├── security.log
├── access.log
├── performance.log
└── audit.log
```

### 4. Admin Dashboard

```vue
<!-- MonitoringDashboard.vue -->
<template>
  <div class="monitoring-dashboard">
    <!-- System Health -->
    <HealthStatus :status="healthData" />
    
    <!-- Performance Metrics -->
    <MetricsOverview :metrics="metricsData" />
    
    <!-- Recent Alerts -->
    <AlertsList :alerts="alertsData" />
    
    <!-- Log Viewer -->
    <LogViewer :logs="logsData" />
  </div>
</template>
```

## 🔧 Maintenance Scripts

### 1. Full Maintenance

```bash
# Chạy tất cả maintenance tasks
npm run maintenance:full

# Bao gồm:
# - Security audit
# - Database optimization
# - Redis setup
```

### 2. Individual Tasks

```bash
# Security audit
npm run security:audit

# Database optimization
npm run db:optimize

# Redis management
npm run redis:setup
npm run redis:clear

# Health check
npm run health:check
```

## 📈 Performance Tuning

### 1. Database Indexes

```javascript
// Recommended compound indexes
db.books.createIndex({ category: 1, isAvailable: 1 })
db.books.createIndex({ author: 1, publishedYear: -1 })
db.borrowrecords.createIndex({ userId: 1, status: 1 })
db.borrowrecords.createIndex({ borrowDate: -1, status: 1 })
```

### 2. Cache Strategies

```javascript
// Cache patterns
const cacheKey = `books:category:${categoryId}`;
const cachedData = await cacheService.get(cacheKey);

if (!cachedData) {
  const data = await Book.find({ category: categoryId });
  await cacheService.set(cacheKey, data, 3600); // 1 hour
  return data;
}

return cachedData;
```

### 3. Query Optimization

```javascript
// Efficient pagination
const books = await Book.find(query)
  .select('title author category isAvailable')
  .limit(limit)
  .skip(skip)
  .lean(); // Faster queries

// Aggregation pipelines
const stats = await Book.aggregate([
  { $match: { isAvailable: true } },
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

## 🛡️ Security Best Practices

### 1. Environment Security

```bash
# File permissions (Unix/Linux)
chmod 600 .env.production
chmod 600 ecosystem.config.js

# Never commit sensitive files
echo ".env*" >> .gitignore
echo "logs/" >> .gitignore
```

### 2. Production Deployment

```bash
# Use PM2 for production
npm run pm2:start

# Enable SSL/TLS
# Configure reverse proxy (nginx)
# Set up firewall rules
# Regular security updates
```

### 3. Monitoring Alerts

```javascript
// Alert thresholds
const ALERT_THRESHOLDS = {
  memory: 80,        // 80% memory usage
  cpu: 85,           // 85% CPU usage
  disk: 90,          // 90% disk usage
  errorRate: 5,      // 5% error rate
  responseTime: 2000 // 2 seconds
};
```

## 📚 API Documentation

### Security Endpoints

```bash
# Health check
GET /api/health

# Metrics (admin only)
GET /api/metrics

# Logs (admin only)
GET /api/logs?category=security&limit=100

# Cache stats (admin only)
GET /api/cache/stats
```

### Rate Limiting Headers

```bash
# Response headers
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 900
```

## 🚨 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Check Redis status
   redis-cli ping
   
   # Start Redis
   redis-server
   ```

2. **High Memory Usage**
   ```bash
   # Check cache size
   curl http://localhost:3000/api/cache/stats
   
   # Clear cache if needed
   npm run redis:clear
   ```

3. **Slow Database Queries**
   ```bash
   # Run database optimization
   npm run db:optimize:full
   
   # Check slow queries
   db.system.profile.find().sort({ts: -1}).limit(5)
   ```

4. **Security Alerts**
   ```bash
   # Run security audit
   npm run security:audit
   
   # Check security logs
   npm run logs:security
   ```

### Performance Monitoring

```bash
# Monitor in real-time
watch -n 5 'curl -s http://localhost:3000/api/health | jq .'

# Check PM2 status
pm2 status
pm2 monit
```

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra logs: `npm run logs:security` hoặc `npm run logs:performance`
2. Chạy health check: `npm run health:check`
3. Chạy security audit: `npm run security:audit`
4. Kiểm tra documentation trong code

---

**Lưu ý**: Luôn backup dữ liệu trước khi chạy optimization scripts trong production.