const mongoose = require('mongoose');
require('dotenv').config();

async function dropDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('🔌 Connected to MongoDB');
    
    // Drop the database
    await mongoose.connection.db.dropDatabase();
    console.log('🗑️  Database dropped successfully');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database reset complete');
    
  } catch (error) {
    console.error('❌ Error dropping database:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  dropDatabase();
}

module.exports = dropDatabase;