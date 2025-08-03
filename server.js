const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import services and middleware
const { 
  rateLimits, 
  securityHeaders, 
  corsOptions, 
  compressionConfig, 
  sanitizeRequest, 
  logSecurityEvents 
} = require('./server/middleware/security');
const cacheService = require('./server/services/cacheService');
const monitoringService = require('./server/services/monitoringService');
const loggingService = require('./server/services/loggingService');

// Import database connection
const connectDB = require('./server/config/database');

// Import routes
const authRoutes = require('./server/routes/auth');
const bookRoutes = require('./server/routes/books');
const userRoutes = require('./server/routes/users');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to MongoDB
connectDB();

// Security middleware
app.use(securityHeaders);
app.use(compressionConfig);

// CORS configuration
app.use(require('cors')(corsOptions));

// Request monitoring and logging
app.use(monitoringService.requestTracker());
app.use(loggingService.requestLogger());
app.use(logSecurityEvents);

// Body parsing middleware with sanitization
const maxFileSize = process.env.MAX_FILE_SIZE || '10mb';
app.use(express.json({ limit: maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: maxFileSize }));
app.use(sanitizeRequest);

// Apply different rate limits to different routes
app.use('/api/auth', rateLimits.auth);
app.use('/api/books/search', rateLimits.search);
app.use('/api/upload', rateLimits.upload);
app.use('/api', rateLimits.general);

// Health check and monitoring endpoints
app.get('/api/health', async (req, res) => {
  try {
    const health = await monitoringService.getHealthStatus();
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    loggingService.logError(error, { endpoint: '/api/health' });
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = monitoringService.getDetailedMetrics();
    res.json(metrics);
  } catch (error) {
    loggingService.logError(error, { endpoint: '/api/metrics' });
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const { category = 'application', lines = 100 } = req.query;
    const logs = await loggingService.getRecentLogs(category, parseInt(lines));
    res.json({ logs, category, lines: parseInt(lines) });
  } catch (error) {
    loggingService.logError(error, { endpoint: '/api/logs' });
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

app.get('/api/cache/stats', async (req, res) => {
  try {
    const stats = await cacheService.getStats();
    res.json(stats);
  } catch (error) {
    loggingService.logError(error, { endpoint: '/api/cache/stats' });
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.VITE_APP_VERSION || '1.0.0'
  });
});

// API metrics endpoint (production only)
if (NODE_ENV === 'production' && process.env.ENABLE_METRICS === 'true') {
  app.get('/api/metrics', (req, res) => {
    res.json({
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });
}

// Serve frontend (SPA) in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // SPA fallback (redirect all other routes to index.html)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Digital Library API Server',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/api/metrics`);
  
  // Log startup event
  loggingService.logBusinessEvent('server_started', {
    port: PORT,
    environment: NODE_ENV,
    nodeVersion: process.version,
    pid: process.pid
  });
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  loggingService.logBusinessEvent('server_shutdown_initiated', { signal });
  
  // Stop accepting new connections
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    try {
      // Close database connection
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
      
      // Close cache connection
      await cacheService.disconnect();
      console.log('✅ Cache connection closed');
      
      loggingService.logBusinessEvent('server_shutdown_completed', { signal });
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      loggingService.logError(error, { context: 'graceful_shutdown' });
      process.exit(1);
    }
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  loggingService.logError(error, { context: 'uncaught_exception' });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  loggingService.logError(new Error(reason), { context: 'unhandled_rejection' });
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;
