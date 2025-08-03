/**
 * Redis Setup Script with Mock Fallback
 * Sets up Redis connection or uses mock service for development
 */

const fs = require('fs');
const path = require('path');
const MockRedisService = require('../services/mockRedisService');

class RedisSetup {
    constructor() {
        this.client = null;
        this.usingMock = false;
    }

    async connect() {
        try {
            console.log('🔄 Attempting to connect to Redis...');
            
            // Try to require redis and connect
            try {
                const redis = require('redis');
                this.client = redis.createClient({
                    host: process.env.REDIS_HOST || 'localhost',
                    port: process.env.REDIS_PORT || 6379,
                    password: process.env.REDIS_PASSWORD || undefined,
                    db: process.env.REDIS_DB || 0
                });
                
                await this.client.connect();
                await this.client.ping();
                console.log('✅ Connected to real Redis server');
                this.usingMock = false;
            } catch (error) {
                console.log('⚠️ Redis server not available, using mock service');
                this.client = new MockRedisService();
                await this.client.connect();
                this.usingMock = true;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to Redis:', error.message);
            throw error;
        }
    }

    async testConnection() {
        try {
            console.log('🧪 Testing connection...');
            
            // Test basic operations
            await this.client.set('test:connection', 'success', { EX: 10 });
            const result = await this.client.get('test:connection');
            
            if (result === 'success') {
                console.log(`✅ ${this.usingMock ? 'Mock Redis' : 'Redis'} connection test passed`);
                await this.client.del('test:connection');
                return true;
            } else {
                throw new Error('Connection test failed');
            }
        } catch (error) {
            console.error('❌ Connection test failed:', error.message);
            return false;
        }
    }

    async setupInitialData() {
        try {
            console.log('📝 Setting up initial data...');
            
            const initialData = {
                'app:version': '1.0.0',
                'app:name': 'Digital Library',
                'cache:stats': JSON.stringify({
                    hits: 0,
                    misses: 0,
                    created: new Date().toISOString()
                }),
                'system:health': JSON.stringify({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    service: this.usingMock ? 'mock-redis' : 'redis'
                })
            };
            
            for (const [key, value] of Object.entries(initialData)) {
                await this.client.set(key, value);
                console.log(`  ✓ Set ${key}`);
            }
            
            console.log(`✅ Initial data setup complete (${Object.keys(initialData).length} keys)`);
            return true;
        } catch (error) {
            console.error('❌ Failed to setup initial data:', error.message);
            return false;
        }
    }

    async clearCache() {
        try {
            console.log('🧹 Clearing cache...');
            
            // Get all cache keys
            const cacheKeys = await this.client.keys('cache:*');
            
            if (cacheKeys.length > 0) {
                for (const key of cacheKeys) {
                    await this.client.del(key);
                }
                console.log(`✅ Cleared ${cacheKeys.length} cache entries`);
            } else {
                console.log('✅ No cache entries to clear');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to clear cache:', error.message);
            return false;
        }
    }

    async getRedisInfo() {
        try {
            console.log('📊 Getting Redis info...');
            
            const info = await this.client.info();
            const keys = await this.client.keys('*');
            
            console.log('Redis Information:');
            if (this.usingMock) {
                console.log(`  Service: Mock Redis Service`);
                console.log(`  Keys: ${keys.length}`);
                console.log(`  Status: Connected`);
            } else {
                console.log(`  Version: ${info.redis_version || 'Unknown'}`);
                console.log(`  Connected clients: ${info.connected_clients || 'Unknown'}`);
                console.log(`  Used memory: ${info.used_memory_human || info.used_memory || 'Unknown'}`);
                console.log(`  Keys: ${keys.length}`);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to get Redis info:', error.message);
            return false;
        }
    }

    async createConfigFile() {
        try {
            console.log('⚙️ Creating Redis config file...');
            
            const configPath = path.join(__dirname, '..', 'config', 'redis.conf');
            const configDir = path.dirname(configPath);
            
            // Ensure config directory exists
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            
            // Check if config file already exists
            if (fs.existsSync(configPath)) {
                console.log('⚠️ Redis config file already exists, skipping...');
                return false;
            }
            
            const config = `# Redis Configuration for Digital Library
# Generated on ${new Date().toISOString()}

# Network
bind 127.0.0.1
port 6379

# General
daemonize no
timeout 0
tcp-keepalive 300

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Security
# requirepass your_password_here

# Logging
loglevel notice
logfile ""

# Database
databases 16
`;
            
            fs.writeFileSync(configPath, config);
            console.log(`✅ Redis config file created: ${configPath}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to create config file:', error.message);
            return false;
        }
    }

    async disconnect() {
        try {
            if (this.client) {
                await this.client.disconnect();
                console.log('🔌 Disconnected from Redis');
            }
        } catch (error) {
            console.error('⚠️ Error during disconnect:', error.message);
        }
    }

    async run() {
        console.log('🚀 Starting Redis Setup...');
        console.log('='.repeat(50));
        
        try {
            // Connect to Redis
            await this.connect();
            
            // Test connection
            const connectionOk = await this.testConnection();
            if (!connectionOk) {
                throw new Error('Connection test failed');
            }
            
            // Setup initial data
            await this.setupInitialData();
            
            // Clear old cache
            await this.clearCache();
            
            // Get Redis info
            await this.getRedisInfo();
            
            // Create config file
            const configCreated = await this.createConfigFile();
            
            console.log('\n📊 Redis Setup Complete!');
            console.log('='.repeat(50));
            console.log(`✅ Connection: Successful (${this.usingMock ? 'Mock Service' : 'Real Redis'})`);
            console.log(`📝 Initial data: Setup complete`);
            console.log(`🧹 Cache cleared: Yes`);
            console.log(`📋 Info retrieved: Yes`);
            console.log(`⚙️ Config file: ${configCreated ? 'Created' : 'Skipped (exists)'}`);
            if (this.usingMock) {
                console.log(`⚠️ Note: Using mock Redis service for development`);
                console.log(`💡 Install Redis server for production use`);
            }
            console.log('='.repeat(50));
            
        } catch (error) {
            console.error('\n❌ Redis Setup Failed!');
            console.error('='.repeat(50));
            console.error(`Error: ${error.message}`);
            console.error('='.repeat(50));
            throw error;
        } finally {
            await this.disconnect();
        }
    }
}

// Run if called directly
if (require.main === module) {
    const setup = new RedisSetup();
    setup.run()
        .then(() => {
            console.log('\n🎉 Redis setup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Redis setup failed:', error.message);
            process.exit(1);
        });
}

module.exports = RedisSetup;