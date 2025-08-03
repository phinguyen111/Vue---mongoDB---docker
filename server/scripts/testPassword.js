const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function testPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital_library');
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'phidzdz26@gmail.com' }).select('+password');
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User found:', user.email);
    console.log('🔒 Stored hash:', user.password);
    
    const testPassword = 'user123';
    console.log('🔍 Testing password:', testPassword);
    
    // Test bcrypt compare directly
    const directCompare = await bcrypt.compare(testPassword, user.password);
    console.log('🔍 Direct bcrypt.compare result:', directCompare);
    
    // Test user method
    const methodCompare = await user.comparePassword(testPassword);
    console.log('🔍 User.comparePassword result:', methodCompare);
    
    // Test with wrong password
    const wrongCompare = await bcrypt.compare('wrongpassword', user.password);
    console.log('🔍 Wrong password compare:', wrongCompare);
    
    // Test hash generation
    console.log('\n🔧 Testing hash generation:');
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('🔍 New hash for same password:', newHash);
    const newHashCompare = await bcrypt.compare(testPassword, newHash);
    console.log('🔍 New hash compare result:', newHashCompare);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testPassword();