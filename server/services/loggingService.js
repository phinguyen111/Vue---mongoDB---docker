const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

class LoggingService {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
    this.setupLoggers();
  }

  // Ensure logs directory exists
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Setup different loggers for different purposes
  setupLoggers() {
    // Custom format for logs
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
          log += ` ${JSON.stringify(meta)}`;
        }
        
        if (stack) {
          log += `\n${stack}`;
        }
        
        return log;
      })
    );

    // JSON format for structured logging
    const jsonFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    // Application Logger
    this.appLogger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'digital-library' },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            logFormat
          ),
          silent: process.env.NODE_ENV === 'test'
        }),
        
        // Daily rotate file for all logs
        new DailyRotateFile({
          filename: path.join(this.logDir, 'application-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: jsonFormat
        }),
        
        // Separate file for errors
        new DailyRotateFile({
          filename: path.join(this.logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
          format: jsonFormat
        })
      ]
    });

    // Security Logger
    this.securityLogger = winston.createLogger({
      level: 'info',
      format: jsonFormat,
      defaultMeta: { service: 'digital-library-security' },
      transports: [
        new DailyRotateFile({
          filename: path.join(this.logDir, 'security-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '90d', // Keep security logs longer
          format: jsonFormat
        })
      ]
    });

    // Access Logger (for HTTP requests)
    this.accessLogger = winston.createLogger({
      level: 'info',
      format: jsonFormat,
      defaultMeta: { service: 'digital-library-access' },
      transports: [
        new DailyRotateFile({
          filename: path.join(this.logDir, 'access-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '50m',
          maxFiles: '7d',
          format: jsonFormat
        })
      ]
    });

    // Performance Logger
    this.performanceLogger = winston.createLogger({
      level: 'info',
      format: jsonFormat,
      defaultMeta: { service: 'digital-library-performance' },
      transports: [
        new DailyRotateFile({
          filename: path.join(this.logDir, 'performance-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: jsonFormat
        })
      ]
    });

    // Audit Logger (for important business events)
    this.auditLogger = winston.createLogger({
      level: 'info',
      format: jsonFormat,
      defaultMeta: { service: 'digital-library-audit' },
      transports: [
        new DailyRotateFile({
          filename: path.join(this.logDir, 'audit-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '365d', // Keep audit logs for a year
          format: jsonFormat
        })
      ]
    });
  }

  // HTTP Request Logging Middleware
  requestLogger() {
    return (req, res, next) => {
      const startTime = Date.now();
      const originalSend = res.send;
      
      // Capture response data
      res.send = function(data) {
        const responseTime = Date.now() - startTime;
        const contentLength = Buffer.byteLength(data, 'utf8');
        
        // Log access information
        loggingService.accessLogger.info('HTTP Request', {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          responseTime,
          contentLength,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          userId: req.user?.id,
          timestamp: new Date().toISOString()
        });
        
        // Log slow requests
        if (responseTime > 5000) {
          loggingService.performanceLogger.warn('Slow Request', {
            method: req.method,
            url: req.originalUrl,
            responseTime,
            statusCode: res.statusCode,
            userId: req.user?.id
          });
        }
        
        return originalSend.call(this, data);
      };
      
      next();
    };
  }

  // Security Event Logging
  logSecurityEvent(event, details) {
    this.securityLogger.warn('Security Event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Audit Event Logging
  logAuditEvent(action, userId, resource, details = {}) {
    this.auditLogger.info('Audit Event', {
      action,
      userId,
      resource,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Performance Event Logging
  logPerformanceEvent(operation, duration, details = {}) {
    this.performanceLogger.info('Performance Event', {
      operation,
      duration,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Database Operation Logging
  logDatabaseOperation(operation, collection, duration, error = null) {
    const logData = {
      operation,
      collection,
      duration,
      timestamp: new Date().toISOString()
    };
    
    if (error) {
      logData.error = error.message;
      this.appLogger.error('Database Operation Failed', logData);
    } else {
      this.performanceLogger.info('Database Operation', logData);
    }
  }

  // User Action Logging
  logUserAction(userId, action, resource, details = {}) {
    this.auditLogger.info('User Action', {
      userId,
      action,
      resource,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Error Logging with Context
  logError(error, context = {}) {
    this.appLogger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Business Logic Logging
  logBusinessEvent(event, data) {
    this.appLogger.info('Business Event', {
      event,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // System Health Logging
  logSystemHealth(metrics) {
    this.performanceLogger.info('System Health', {
      metrics,
      timestamp: new Date().toISOString()
    });
  }

  // Get log statistics
  async getLogStats() {
    try {
      const stats = {};
      const logFiles = await fs.promises.readdir(this.logDir);
      
      for (const file of logFiles) {
        const filePath = path.join(this.logDir, file);
        const stat = await fs.promises.stat(filePath);
        
        const category = file.split('-')[0];
        if (!stats[category]) {
          stats[category] = {
            files: 0,
            totalSize: 0,
            lastModified: null
          };
        }
        
        stats[category].files++;
        stats[category].totalSize += stat.size;
        
        if (!stats[category].lastModified || stat.mtime > stats[category].lastModified) {
          stats[category].lastModified = stat.mtime;
        }
      }
      
      return stats;
    } catch (error) {
      this.appLogger.error('Failed to get log statistics', { error: error.message });
      return {};
    }
  }

  // Clean old logs
  async cleanOldLogs(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const logFiles = await fs.promises.readdir(this.logDir);
      let deletedFiles = 0;
      
      for (const file of logFiles) {
        const filePath = path.join(this.logDir, file);
        const stat = await fs.promises.stat(filePath);
        
        if (stat.mtime < cutoffDate) {
          await fs.promises.unlink(filePath);
          deletedFiles++;
        }
      }
      
      this.appLogger.info('Log cleanup completed', {
        deletedFiles,
        daysToKeep,
        cutoffDate: cutoffDate.toISOString()
      });
      
      return { deletedFiles, cutoffDate };
    } catch (error) {
      this.appLogger.error('Log cleanup failed', { error: error.message });
      throw error;
    }
  }

  // Get recent logs
  async getRecentLogs(category = 'application', lines = 100) {
    try {
      const logFiles = await fs.promises.readdir(this.logDir);
      const categoryFiles = logFiles
        .filter(file => file.startsWith(category))
        .sort()
        .reverse();
      
      if (categoryFiles.length === 0) {
        return [];
      }
      
      const latestFile = path.join(this.logDir, categoryFiles[0]);
      const content = await fs.promises.readFile(latestFile, 'utf8');
      const logLines = content.split('\n').filter(line => line.trim());
      
      return logLines
        .slice(-lines)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return { message: line, timestamp: new Date().toISOString() };
          }
        });
    } catch (error) {
      this.appLogger.error('Failed to get recent logs', {
        category,
        error: error.message
      });
      return [];
    }
  }

  // Search logs
  async searchLogs(query, category = 'application', maxResults = 100) {
    try {
      const logs = await this.getRecentLogs(category, 1000);
      const results = logs.filter(log => {
        const logString = JSON.stringify(log).toLowerCase();
        return logString.includes(query.toLowerCase());
      });
      
      return results.slice(0, maxResults);
    } catch (error) {
      this.appLogger.error('Log search failed', {
        query,
        category,
        error: error.message
      });
      return [];
    }
  }

  // Get logger instance
  getLogger(type = 'app') {
    switch (type) {
      case 'security': return this.securityLogger;
      case 'access': return this.accessLogger;
      case 'performance': return this.performanceLogger;
      case 'audit': return this.auditLogger;
      default: return this.appLogger;
    }
  }
}

// Create singleton instance
const loggingService = new LoggingService();

module.exports = loggingService;