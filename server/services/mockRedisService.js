/**
 * Mock Redis Service for Development
 * Provides basic Redis-like functionality without requiring Redis server
 */

class MockRedisService {
    constructor() {
        this.store = new Map();
        this.connected = true; // Mock service is always connected
        console.log('🔧 Mock Redis Service initialized');
    }

    async connect() {
        this.connected = true;
        console.log('✅ Mock Redis connected successfully');
        return true;
    }

    async disconnect() {
        this.connected = false;
        console.log('🔌 Mock Redis disconnected');
        return true;
    }

    async ping() {
        if (!this.connected) {
            throw new Error('Redis not connected');
        }
        return 'PONG';
    }

    async set(key, value, options = {}) {
        if (!this.connected) {
            throw new Error('Redis not connected');
        }
        
        const item = {
            value: JSON.stringify(value),
            timestamp: Date.now(),
            ttl: options.EX ? options.EX * 1000 : null
        };
        
        this.store.set(key, item);
        console.log(`📝 Mock Redis SET: ${key}`);
        return 'OK';
    }

    async get(key) {
        if (!this.connected) {
            throw new Error('Redis not connected');
        }
        
        const item = this.store.get(key);
        if (!item) return null;
        
        // Check TTL
        if (item.ttl && Date.now() - item.timestamp > item.ttl) {
            this.store.delete(key);
            return null;
        }
        
        console.log(`📖 Mock Redis GET: ${key}`);
        return JSON.parse(item.value);
    }

    async del(key) {
        if (!this.connected) {
            throw new Error('Redis not connected');
        }
        
        const deleted = this.store.delete(key);
        console.log(`🗑️ Mock Redis DEL: ${key} (${deleted ? 'success' : 'not found'})`);
        return deleted ? 1 : 0;
    }

    async flushall() {
        if (!this.connected) {
            throw new Error('Redis not connected');
        }
        
        const count = this.store.size;
        this.store.clear();
        console.log(`🧹 Mock Redis FLUSHALL: ${count} keys deleted`);
        return 'OK';
    }

    async keys(pattern = '*') {
        if (!this.connected) {
            throw new Error('Redis not connected');
        }
        
        const allKeys = Array.from(this.store.keys());
        
        if (pattern === '*') {
            return allKeys;
        }
        
        // Simple pattern matching (only supports * wildcard)
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return allKeys.filter(key => regex.test(key));
    }

    async info() {
        if (!this.connected) {
            throw new Error('Redis not connected');
        }
        
        return {
            redis_version: 'mock-1.0.0',
            connected_clients: 1,
            used_memory: this.store.size * 100, // Mock memory usage
            total_commands_processed: 0,
            keyspace: {
                db0: {
                    keys: this.store.size,
                    expires: 0
                }
            }
        };
    }

    // Health check method
    async healthCheck() {
        try {
            await this.ping();
            return {
                status: 'healthy',
                service: 'mock-redis',
                timestamp: new Date().toISOString(),
                keys_count: this.store.size
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                service: 'mock-redis',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = MockRedisService;