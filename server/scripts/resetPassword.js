const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function resetPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital_library');
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'phidzdz26@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User found:', user.email);
    
    // Generate new hash for 'user123'
    const newPassword = 'user123';
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    
    console.log('🔧 Generated new hash:', newHash);
    
    // Verify the new hash works
    const testCompare = await bcrypt.compare(newPassword, newHash);
    console.log('🔍 New hash verification:', testCompare);
    
    if (testCompare) {
      // Update user password directly in database
      await User.updateOne(
        { email: 'phidzdz26@gmail.com' },
        { $set: { password: newHash } }
      );
      
      console.log('✅ Password updated successfully!');
      
      // Verify update
      const updatedUser = await User.findOne({ email: 'phidzdz26@gmail.com' }).select('+password');
      console.log('🔍 Updated hash in DB:', updatedUser.password);
      
      // Test final comparison
      const finalTest = await bcrypt.compare(newPassword, updatedUser.password);
      console.log('🔍 Final test result:', finalTest);
    } else {
      console.log('❌ Hash generation failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

resetPassword();