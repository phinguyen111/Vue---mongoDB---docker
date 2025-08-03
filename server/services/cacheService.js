const redis = require('redis');
const { securityLogger } = require('../middleware/security');
const MockRedisService = require('./mockRedisService');

class CacheService {
  constructor() {
    this.usingMock = false;
    this.defaultTTL = parseInt(process.env.CACHE_TTL) || 3600; // 1 hour default
    this.isConnected = false;
    
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: 1, // Use different DB for caching
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        console.log('⚠️ Redis not available, switching to mock service');
        this.switchToMock();
      });
      
      // Try to connect immediately and switch to mock if fails
      setTimeout(() => {
        if (!this.isConnected && !this.usingMock) {
          console.log('⚠️ Redis connection timeout, switching to mock service');
          this.switchToMock();
        }
      }, 1000);

      this.client.on('connect', () => {
        console.log('Cache Service connected to Redis');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        this.isConnected = true;
      });

      this.client.on('end', () => {
        this.isConnected = false;
      });
    } catch (error) {
      console.log('⚠️ Redis client creation failed, using mock service');
      this.switchToMock();
    }
  }
  
  switchToMock() {
    if (!this.usingMock) {
      this.usingMock = true;
      this.client = new MockRedisService();
      this.isConnected = true;
      console.log('🔧 Cache service switched to mock Redis');
    }
  }

  // Generate cache key with prefix
  generateKey(prefix, ...parts) {
    return `digital_library:${prefix}:${parts.join(':')}`;
  }

  // Get data from cache
  async get(key) {
    if (!this.isConnected) return null;
    
    try {
      if (this.usingMock) {
        return await this.client.get(key);
      } else {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      if (!this.usingMock) {
        this.switchToMock();
        return await this.client.get(key);
      }
      securityLogger.error('Cache get error:', { key, error: error.message });
      return null;
    }
  }

  // Set data in cache
  async set(key, data, ttl = this.defaultTTL) {
    if (!this.isConnected) return false;
    
    try {
      if (this.usingMock) {
        return await this.client.set(key, data, ttl);
      } else {
        await this.client.setex(key, ttl, JSON.stringify(data));
        return true;
      }
    } catch (error) {
      if (!this.usingMock) {
        this.switchToMock();
        return await this.client.set(key, data, ttl);
      }
      securityLogger.error('Cache set error:', { key, error: error.message });
      return false;
    }
  }

  // Delete from cache
  async del(key) {
    if (!this.isConnected) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      securityLogger.error('Cache delete error:', { key, error: error.message });
      return false;
    }
  }

  // Delete multiple keys by pattern
  async delPattern(pattern) {
    if (!this.isConnected) return false;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      securityLogger.error('Cache delete pattern error:', { pattern, error: error.message });
      return false;
    }
  }

  // Check if key exists
  async exists(key) {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      securityLogger.error('Cache exists error:', { key, error: error.message });
      return false;
    }
  }

  // Increment counter
  async incr(key, ttl = this.defaultTTL) {
    if (!this.isConnected) return 0;
    
    try {
      const result = await this.client.incr(key);
      if (result === 1) {
        await this.client.expire(key, ttl);
      }
      return result;
    } catch (error) {
      securityLogger.error('Cache increment error:', { key, error: error.message });
      return 0;
    }
  }

  // Cache middleware for Express routes
  middleware(prefix, ttl = this.defaultTTL) {
    return async (req, res, next) => {
      if (!this.isConnected) {
        return next();
      }

      // Generate cache key based on URL and query parameters
      const cacheKey = this.generateKey(
        prefix,
        req.originalUrl,
        JSON.stringify(req.query),
        req.user?.id || 'anonymous'
      );

      try {
        const cachedData = await this.get(cacheKey);
        
        if (cachedData) {
          res.set('X-Cache', 'HIT');
          return res.json(cachedData);
        }

        // Store original res.json method
        const originalJson = res.json;
        
        // Override res.json to cache the response
        res.json = function(data) {
          res.set('X-Cache', 'MISS');
          
          // Cache successful responses only
          if (res.statusCode >= 200 && res.statusCode < 300) {
            cacheService.set(cacheKey, data, ttl).catch(err => {
              securityLogger.error('Failed to cache response:', err);
            });
          }
          
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        securityLogger.error('Cache middleware error:', error);
        next();
      }
    };
  }

  // Specific cache methods for common operations
  async cacheBooks(filters, data, ttl = 300) { // 5 minutes for books
    const key = this.generateKey('books', JSON.stringify(filters));
    return await this.set(key, data, ttl);
  }

  async getCachedBooks(filters) {
    const key = this.generateKey('books', JSON.stringify(filters));
    return await this.get(key);
  }

  async invalidateBookCache() {
    return await this.delPattern('digital_library:books:*');
  }

  async cacheUser(userId, data, ttl = 1800) { // 30 minutes for user data
    const key = this.generateKey('user', userId);
    return await this.set(key, data, ttl);
  }

  async getCachedUser(userId) {
    const key = this.generateKey('user', userId);
    return await this.get(key);
  }

  async invalidateUserCache(userId) {
    const key = this.generateKey('user', userId);
    return await this.del(key);
  }

  async cacheStats(data, ttl = 600) { // 10 minutes for stats
    const key = this.generateKey('stats', 'dashboard');
    return await this.set(key, data, ttl);
  }

  async getCachedStats() {
    const key = this.generateKey('stats', 'dashboard');
    return await this.get(key);
  }

  // Session management
  async setSession(sessionId, data, ttl = 86400) { // 24 hours
    const key = this.generateKey('session', sessionId);
    return await this.set(key, data, ttl);
  }

  async getSession(sessionId) {
    const key = this.generateKey('session', sessionId);
    return await this.get(key);
  }

  async deleteSession(sessionId) {
    const key = this.generateKey('session', sessionId);
    return await this.del(key);
  }

  // Health check
  async healthCheck() {
    console.log('🔍 Cache healthCheck - usingMock:', this.usingMock, 'isConnected:', this.isConnected);
    try {
      if (this.usingMock) {
        const result = await this.client.healthCheck();
        console.log('🔍 Mock healthCheck result:', result);
        return { status: result.status, connected: true };
      } else {
        await this.client.ping();
        return { status: 'healthy', connected: this.isConnected };
      }
    } catch (error) {
      console.log('🔍 Cache healthCheck error:', error.message);
      if (!this.usingMock) {
        this.switchToMock();
        const result = await this.client.healthCheck();
        console.log('🔍 Mock healthCheck result after switch:', result);
        return { status: result.status, connected: true };
      }
      return { status: 'unhealthy', connected: false, error: error.message };
    }
  }

  // Get cache statistics
  async getStats() {
    if (!this.isConnected) return null;
    
    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        memory: info,
        keyspace: keyspace,
        connected: this.isConnected
      };
    } catch (error) {
      securityLogger.error('Cache stats error:', error);
      return null;
    }
  }

  // Graceful shutdown
  async disconnect() {
    try {
      await this.client.quit();
      console.log('Cache service disconnected');
    } catch (error) {
      securityLogger.error('Cache disconnect error:', error);
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;