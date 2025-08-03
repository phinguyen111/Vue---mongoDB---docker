const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const connectDB = require('../config/database');

async function testRegistration() {
  try {
    console.log('🧪 TESTING USER REGISTRATION DIRECTLY');
    console.log('=' .repeat(50));
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Check current user count
    const initialCount = await User.countDocuments();
    console.log(`📊 Initial user count: ${initialCount}`);
    
    // Create test user
    const testEmail = `directtest${Date.now()}@example.com`;
    console.log(`\n🔍 Creating user: ${testEmail}`);
    
    const userData = {
      name: 'Direct Test User',
      email: testEmail,
      password: 'password123',
      role: 'user'
    };
    
    console.log('📝 User data:', userData);
    
    // Method 1: Direct save
    console.log('\n🔄 Method 1: Direct User.save()');
    const user1 = new User(userData);
    console.log('User created in memory:', !!user1);
    
    const savedUser1 = await user1.save();
    console.log('✅ User saved with ID:', savedUser1._id);
    
    // Verify immediately
    const found1 = await User.findById(savedUser1._id);
    console.log('🔍 Found in DB immediately:', !!found1);
    
    // Check count after save
    const countAfterSave = await User.countDocuments();
    console.log(`📊 User count after save: ${countAfterSave}`);
    
    // Method 2: User.create()
    console.log('\n🔄 Method 2: User.create()');
    const testEmail2 = `directtest2${Date.now()}@example.com`;
    const userData2 = {
      name: 'Direct Test User 2',
      email: testEmail2,
      password: 'password123',
      role: 'user'
    };
    
    const savedUser2 = await User.create(userData2);
    console.log('✅ User created with ID:', savedUser2._id);
    
    // Verify immediately
    const found2 = await User.findById(savedUser2._id);
    console.log('🔍 Found in DB immediately:', !!found2);
    
    // Final count
    const finalCount = await User.countDocuments();
    console.log(`📊 Final user count: ${finalCount}`);
    
    // List all users
    console.log('\n👥 All users in database:');
    const allUsers = await User.find({}).select('name email createdAt');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.createdAt}`);
    });
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
}

// Run if called directly
if (require.main === module) {
  testRegistration();
}

module.exports = testRegistration;