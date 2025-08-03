require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User');
const connectDB = require('./server/config/database');

async function resetUser() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Delete existing user
    const deleteResult = await User.deleteOne({ email: 'direct@test.com' });
    console.log('🗑️ Deleted user:', deleteResult.deletedCount > 0 ? 'Success' : 'User not found');
    
    console.log('✅ User reset complete. You can now register again.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

resetUser();