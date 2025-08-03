const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Database optimization and performance tuning script
class DatabaseOptimizer {
  constructor() {
    this.connection = null;
    this.collections = [];
    this.optimizationResults = {
      indexes: [],
      queries: [],
      performance: {},
      recommendations: []
    };
  }

  async connect() {
    try {
      console.log('🔄 Connecting to MongoDB...');
      
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/digital_library';
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      this.connection = mongoose.connection;
      console.log('✅ Connected to MongoDB');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      return false;
    }
  }

  async getCollections() {
    try {
      console.log('📋 Getting database collections...');
      
      const collections = await this.connection.db.listCollections().toArray();
      this.collections = collections.map(col => col.name);
      
      console.log(`Found ${this.collections.length} collections:`);
      this.collections.forEach(name => console.log(`  - ${name}`));
      
      return this.collections;
    } catch (error) {
      console.error('❌ Failed to get collections:', error.message);
      return [];
    }
  }

  async analyzeIndexes() {
    try {
      console.log('\n🔍 Analyzing indexes...');
      console.log('='.repeat(50));
      
      for (const collectionName of this.collections) {
        console.log(`\n📊 Collection: ${collectionName}`);
        
        const collection = this.connection.db.collection(collectionName);
        
        // Get existing indexes
        const indexes = await collection.indexes();
        console.log(`  Existing indexes: ${indexes.length}`);
        
        indexes.forEach((index, i) => {
          console.log(`    ${i + 1}. ${JSON.stringify(index.key)} (${index.name})`);
        });
        
        // Get collection stats
        const stats = await collection.stats();
        console.log(`  Documents: ${stats.count.toLocaleString()}`);
        console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Average document size: ${stats.avgObjSize} bytes`);
        
        // Store results
        this.optimizationResults.indexes.push({
          collection: collectionName,
          indexes: indexes,
          stats: {
            count: stats.count,
            size: stats.size,
            avgObjSize: stats.avgObjSize
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to analyze indexes:', error.message);
      return false;
    }
  }

  async createRecommendedIndexes() {
    try {
      console.log('\n🔧 Creating recommended indexes...');
      console.log('='.repeat(50));
      
      const indexRecommendations = {
        users: [
          { email: 1 },
          { username: 1 },
          { role: 1 },
          { createdAt: -1 },
          { 'profile.department': 1 },
          { isActive: 1, role: 1 }
        ],
        books: [
          { title: 'text' },
          { author: 1 },
          { category: 1 },
          { isbn: 1 },
          { publishedYear: -1 },
          { isAvailable: 1 },
          { createdAt: -1 },
          { category: 1, isAvailable: 1 },
          { author: 1, publishedYear: -1 },
          { 'metadata.tags': 1 }
        ],
        borrowrecords: [
          { userId: 1 },
          { bookId: 1 },
          { borrowDate: -1 },
          { returnDate: 1 },
          { status: 1 },
          { userId: 1, status: 1 },
          { bookId: 1, status: 1 },
          { borrowDate: -1, status: 1 }
        ],
        categories: [
          { name: 1 },
          { parentId: 1 },
          { isActive: 1 }
        ],
        notifications: [
          { userId: 1 },
          { type: 1 },
          { isRead: 1 },
          { createdAt: -1 },
          { userId: 1, isRead: 1 },
          { createdAt: -1, isRead: 1 }
        ]
      };
      
      for (const [collectionName, indexes] of Object.entries(indexRecommendations)) {
        if (!this.collections.includes(collectionName)) {
          console.log(`⚠️ Collection '${collectionName}' not found, skipping...`);
          continue;
        }
        
        console.log(`\n📝 Creating indexes for '${collectionName}'...`);
        const collection = this.connection.db.collection(collectionName);
        
        for (const indexSpec of indexes) {
          try {
            const indexName = Object.keys(indexSpec).join('_');
            
            // Check if index already exists
            const existingIndexes = await collection.indexes();
            const indexExists = existingIndexes.some(idx => 
              JSON.stringify(idx.key) === JSON.stringify(indexSpec)
            );
            
            if (indexExists) {
              console.log(`  ✓ Index ${JSON.stringify(indexSpec)} already exists`);
              continue;
            }
            
            // Create index
            await collection.createIndex(indexSpec, {
              background: true,
              name: `idx_${indexName}`
            });
            
            console.log(`  ✅ Created index: ${JSON.stringify(indexSpec)}`);
          } catch (error) {
            console.log(`  ❌ Failed to create index ${JSON.stringify(indexSpec)}: ${error.message}`);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to create indexes:', error.message);
      return false;
    }
  }

  async analyzeSlowQueries() {
    try {
      console.log('\n🐌 Analyzing slow queries...');
      console.log('='.repeat(50));
      
      // Enable profiling for slow operations (>100ms)
      await this.connection.db.admin().command({
        profile: 2,
        slowms: 100
      });
      
      console.log('✅ Database profiling enabled for operations > 100ms');
      
      // Get current profiling status
      const profilingStatus = await this.connection.db.admin().command({ profile: -1 });
      console.log(`Current profiling level: ${profilingStatus.was}`);
      console.log(`Slow operation threshold: ${profilingStatus.slowms}ms`);
      
      // Get recent slow queries from system.profile collection
      try {
        const profileCollection = this.connection.db.collection('system.profile');
        const slowQueries = await profileCollection
          .find({})
          .sort({ ts: -1 })
          .limit(10)
          .toArray();
        
        if (slowQueries.length > 0) {
          console.log(`\n📊 Recent slow queries (${slowQueries.length}):`);
          slowQueries.forEach((query, i) => {
            console.log(`  ${i + 1}. ${query.command?.find || query.command?.aggregate || 'Unknown'} - ${query.millis}ms`);
          });
        } else {
          console.log('\n✅ No slow queries found in recent history');
        }
        
        this.optimizationResults.queries = slowQueries;
      } catch (error) {
        console.log('ℹ️ Could not access profiling data (may need admin privileges)');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to analyze slow queries:', error.message);
      return false;
    }
  }

  async optimizeCollections() {
    try {
      console.log('\n⚡ Optimizing collections...');
      console.log('='.repeat(50));
      
      for (const collectionName of this.collections) {
        console.log(`\n🔧 Optimizing '${collectionName}'...`);
        
        const collection = this.connection.db.collection(collectionName);
        
        try {
          // Compact collection (MongoDB 4.4+)
          const compactResult = await this.connection.db.admin().command({
            compact: collectionName,
            force: true
          });
          
          if (compactResult.ok) {
            console.log(`  ✅ Collection compacted successfully`);
          }
        } catch (error) {
          console.log(`  ⚠️ Compact not available or failed: ${error.message}`);
        }
        
        // Reindex collection
        try {
          await collection.reIndex();
          console.log(`  ✅ Collection reindexed`);
        } catch (error) {
          console.log(`  ❌ Reindex failed: ${error.message}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to optimize collections:', error.message);
      return false;
    }
  }

  async generatePerformanceReport() {
    try {
      console.log('\n📊 Generating performance report...');
      console.log('='.repeat(50));
      
      // Get database stats
      const dbStats = await this.connection.db.stats();
      
      // Get server status
      const serverStatus = await this.connection.db.admin().command({ serverStatus: 1 });
      
      const report = {
        timestamp: new Date().toISOString(),
        database: {
          name: this.connection.db.databaseName,
          collections: dbStats.collections,
          objects: dbStats.objects,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexSize: dbStats.indexSize,
          avgObjSize: dbStats.avgObjSize
        },
        server: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections,
          memory: serverStatus.mem,
          opcounters: serverStatus.opcounters
        },
        optimization: this.optimizationResults,
        recommendations: this.generateRecommendations(dbStats, serverStatus)
      };
      
      // Save report to file
      const reportPath = path.join(process.cwd(), 'database-performance-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      console.log(`\n📋 Performance Report:`);
      console.log(`Database: ${report.database.name}`);
      console.log(`Collections: ${report.database.collections}`);
      console.log(`Total Objects: ${report.database.objects.toLocaleString()}`);
      console.log(`Data Size: ${(report.database.dataSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Index Size: ${(report.database.indexSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Storage Size: ${(report.database.storageSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`\n💾 Report saved to: ${reportPath}`);
      
      return report;
    } catch (error) {
      console.error('❌ Failed to generate performance report:', error.message);
      return null;
    }
  }

  generateRecommendations(dbStats, serverStatus) {
    const recommendations = [];
    
    // Index recommendations
    if (dbStats.indexSize > dbStats.dataSize * 0.5) {
      recommendations.push({
        type: 'index',
        priority: 'medium',
        message: 'Index size is large relative to data size. Consider reviewing unused indexes.'
      });
    }
    
    // Memory recommendations
    if (serverStatus.mem && serverStatus.mem.resident > 1000) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'High memory usage detected. Consider increasing available RAM or optimizing queries.'
      });
    }
    
    // Connection recommendations
    if (serverStatus.connections && serverStatus.connections.current > 100) {
      recommendations.push({
        type: 'connections',
        priority: 'medium',
        message: 'High number of active connections. Consider connection pooling optimization.'
      });
    }
    
    // Collection size recommendations
    this.optimizationResults.indexes.forEach(result => {
      if (result.stats.count > 100000 && result.indexes.length < 3) {
        recommendations.push({
          type: 'index',
          priority: 'high',
          message: `Collection '${result.collection}' has many documents but few indexes. Consider adding query-specific indexes.`
        });
      }
    });
    
    return recommendations;
  }

  async disconnect() {
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }

  async runOptimization() {
    console.log('🚀 Starting Database Optimization...');
    console.log('='.repeat(60));
    
    try {
      // Connect to database
      const connected = await this.connect();
      if (!connected) {
        console.log('\n💡 Database Optimization Tips:');
        console.log('1. Make sure MongoDB server is running');
        console.log('2. Check MongoDB connection string in .env file');
        console.log('3. Ensure database user has proper permissions');
        return false;
      }
      
      // Get collections
      await this.getCollections();
      
      // Analyze current state
      await this.analyzeIndexes();
      
      // Create recommended indexes
      const shouldCreateIndexes = !process.argv.includes('--no-indexes');
      if (shouldCreateIndexes) {
        await this.createRecommendedIndexes();
      }
      
      // Analyze slow queries
      await this.analyzeSlowQueries();
      
      // Optimize collections
      const shouldOptimize = process.argv.includes('--optimize');
      if (shouldOptimize) {
        await this.optimizeCollections();
      }
      
      // Generate performance report
      const report = await this.generatePerformanceReport();
      
      if (report && report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach((rec, i) => {
          console.log(`  ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
        });
      }
      
      console.log('\n🎉 Database optimization completed!');
      console.log('\n📋 Next steps:');
      console.log('1. Monitor query performance in production');
      console.log('2. Review the generated performance report');
      console.log('3. Consider implementing query result caching');
      console.log('4. Set up database monitoring and alerting');
      
      return true;
    } catch (error) {
      console.error('❌ Database optimization failed:', error.message);
      return false;
    } finally {
      await this.disconnect();
    }
  }
}

// Run optimization if called directly
if (require.main === module) {
  const optimizer = new DatabaseOptimizer();
  
  optimizer.runOptimization()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Optimization error:', error);
      process.exit(1);
    });
}

module.exports = DatabaseOptimizer;