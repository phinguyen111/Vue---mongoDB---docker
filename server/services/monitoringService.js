const os = require('os');
const fs = require('fs').promises;
const path = require('path');
const { securityLogger } = require('../middleware/security');
const cacheService = require('./cacheService');

class MonitoringService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        responseTime: []
      },
      system: {
        startTime: Date.now(),
        uptime: 0,
        memory: {},
        cpu: {},
        disk: {}
      },
      database: {
        connections: 0,
        queries: 0,
        errors: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        errors: 0
      }
    };

    this.alerts = [];
    this.thresholds = {
      memory: 85, // 85% memory usage
      cpu: 80,    // 80% CPU usage
      disk: 90,   // 90% disk usage
      responseTime: 5000, // 5 seconds
      errorRate: 10 // 10% error rate
    };

    // Start monitoring intervals
    this.startMonitoring();
  }

  // Start monitoring intervals
  startMonitoring() {
    // System metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Performance metrics every 5 minutes
    setInterval(() => {
      this.analyzePerformance();
    }, 300000);

    // Cleanup old metrics every hour
    setInterval(() => {
      this.cleanupMetrics();
    }, 3600000);
  }

  // Middleware to track requests
  requestTracker() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Track request start
      this.metrics.requests.total++;
      
      // Override res.end to capture response metrics
      const originalEnd = res.end;
      res.end = (...args) => {
        const responseTime = Date.now() - startTime;
        
        // Track response metrics
        if (res.statusCode >= 200 && res.statusCode < 400) {
          this.metrics.requests.success++;
        } else {
          this.metrics.requests.errors++;
        }
        
        // Store response time (keep last 1000 requests)
        this.metrics.requests.responseTime.push(responseTime);
        if (this.metrics.requests.responseTime.length > 1000) {
          this.metrics.requests.responseTime.shift();
        }
        
        // Check for slow requests
        if (responseTime > this.thresholds.responseTime) {
          this.createAlert('slow_request', {
            url: req.originalUrl,
            method: req.method,
            responseTime,
            statusCode: res.statusCode
          });
        }
        
        originalEnd.apply(res, args);
      };
      
      next();
    };
  }

  // Collect system metrics
  async collectSystemMetrics() {
    try {
      // Memory metrics
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;
      
      this.metrics.system.memory = {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercent: memoryUsagePercent
      };
      
      // CPU metrics
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      
      cpus.forEach(cpu => {
        for (let type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      });
      
      const cpuUsagePercent = 100 - (totalIdle / totalTick) * 100;
      
      this.metrics.system.cpu = {
        cores: cpus.length,
        usagePercent: cpuUsagePercent,
        loadAverage: os.loadavg()
      };
      
      // Uptime
      this.metrics.system.uptime = Date.now() - this.metrics.system.startTime;
      
      // Disk usage (for logs directory)
      try {
        const logsPath = path.join(process.cwd(), 'logs');
        const stats = await fs.stat(logsPath);
        this.metrics.system.disk = {
          logsSize: stats.size
        };
      } catch (error) {
        // Logs directory might not exist yet
      }
      
      // Check thresholds and create alerts
      this.checkThresholds();
      
    } catch (error) {
      securityLogger.error('Error collecting system metrics:', error);
    }
  }

  // Check thresholds and create alerts
  checkThresholds() {
    const { memory, cpu } = this.metrics.system;
    
    if (memory.usagePercent > this.thresholds.memory) {
      this.createAlert('high_memory_usage', {
        current: memory.usagePercent,
        threshold: this.thresholds.memory
      });
    }
    
    if (cpu.usagePercent > this.thresholds.cpu) {
      this.createAlert('high_cpu_usage', {
        current: cpu.usagePercent,
        threshold: this.thresholds.cpu
      });
    }
    
    // Check error rate
    const errorRate = (this.metrics.requests.errors / this.metrics.requests.total) * 100;
    if (errorRate > this.thresholds.errorRate && this.metrics.requests.total > 100) {
      this.createAlert('high_error_rate', {
        current: errorRate,
        threshold: this.thresholds.errorRate,
        totalRequests: this.metrics.requests.total,
        errors: this.metrics.requests.errors
      });
    }
  }

  // Create alert
  createAlert(type, data) {
    const alert = {
      id: Date.now() + Math.random(),
      type,
      data,
      timestamp: new Date().toISOString(),
      severity: this.getAlertSeverity(type)
    };
    
    this.alerts.unshift(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }
    
    // Log critical alerts
    if (alert.severity === 'critical') {
      securityLogger.error('Critical alert:', alert);
    } else {
      securityLogger.warn('Alert:', alert);
    }
  }

  // Get alert severity
  getAlertSeverity(type) {
    const criticalAlerts = ['high_memory_usage', 'high_cpu_usage', 'database_connection_failed'];
    const warningAlerts = ['slow_request', 'high_error_rate'];
    
    if (criticalAlerts.includes(type)) return 'critical';
    if (warningAlerts.includes(type)) return 'warning';
    return 'info';
  }

  // Analyze performance trends
  analyzePerformance() {
    const { responseTime } = this.metrics.requests;
    
    if (responseTime.length > 0) {
      const avgResponseTime = responseTime.reduce((a, b) => a + b, 0) / responseTime.length;
      const maxResponseTime = Math.max(...responseTime);
      const minResponseTime = Math.min(...responseTime);
      
      // Calculate percentiles
      const sorted = [...responseTime].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];
      
      this.metrics.performance = {
        avgResponseTime,
        maxResponseTime,
        minResponseTime,
        p95ResponseTime: p95,
        p99ResponseTime: p99,
        totalRequests: this.metrics.requests.total,
        successRate: (this.metrics.requests.success / this.metrics.requests.total) * 100,
        errorRate: (this.metrics.requests.errors / this.metrics.requests.total) * 100
      };
    }
  }

  // Clean up old metrics
  cleanupMetrics() {
    // Reset request metrics but keep totals
    this.metrics.requests.responseTime = this.metrics.requests.responseTime.slice(-500);
    
    // Remove old alerts (keep last 50)
    this.alerts = this.alerts.slice(0, 50);
  }

  // Get health status
  async getHealthStatus() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: this.metrics.system.uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: await this.checkDatabaseHealth(),
        cache: await this.checkCacheHealth(),
        filesystem: await this.checkFilesystemHealth()
      },
      metrics: this.getMetricsSummary()
    };
    
    // Determine overall health status
    const serviceStatuses = Object.values(health.services).map(s => s.status);
    if (serviceStatuses.includes('unhealthy')) {
      health.status = 'unhealthy';
    } else if (serviceStatuses.includes('degraded')) {
      health.status = 'degraded';
    }
    
    return health;
  }

  // Check database health
  async checkDatabaseHealth() {
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        return { status: 'healthy', message: 'Connected' };
      } else {
        return { status: 'unhealthy', message: 'Disconnected' };
      }
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }

  // Check cache health
  async checkCacheHealth() {
    try {
      const cacheHealth = await cacheService.healthCheck();
      return {
        status: cacheHealth.status,
        message: cacheHealth.connected ? 'Connected' : 'Disconnected'
      };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }

  // Check filesystem health
  async checkFilesystemHealth() {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      await fs.access(logsDir);
      return { status: 'healthy', message: 'Accessible' };
    } catch (error) {
      return { status: 'degraded', message: 'Logs directory not accessible' };
    }
  }

  // Get metrics summary
  getMetricsSummary() {
    return {
      requests: {
        total: this.metrics.requests.total,
        success: this.metrics.requests.success,
        errors: this.metrics.requests.errors,
        successRate: this.metrics.requests.total > 0 
          ? (this.metrics.requests.success / this.metrics.requests.total) * 100 
          : 0
      },
      system: {
        memoryUsage: this.metrics.system.memory.usagePercent || 0,
        cpuUsage: this.metrics.system.cpu.usagePercent || 0,
        uptime: this.metrics.system.uptime
      },
      performance: this.metrics.performance || {}
    };
  }

  // Get detailed metrics
  getDetailedMetrics() {
    return {
      ...this.metrics,
      alerts: this.alerts.slice(0, 20), // Last 20 alerts
      performance: this.metrics.performance || {}
    };
  }

  // Get alerts
  getAlerts(severity = null, limit = 50) {
    let alerts = this.alerts;
    
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    return alerts.slice(0, limit);
  }

  // Clear alerts
  clearAlerts() {
    this.alerts = [];
  }

  // Export metrics for external monitoring
  exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.getDetailedMetrics(),
      health: this.getHealthStatus()
    };
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

module.exports = monitoringService;