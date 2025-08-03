require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User');
const connectDB = require('./server/config/database');

async function checkDuplicateUsers() {
  try {
    console.log('🔍 Checking for duplicate users...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Find all users with the test email
    const email = 'direct@test.com';
    const users = await User.find({ email: email });
    
    console.log(`\n📊 Found ${users.length} user(s) with email: ${email}`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log('  ID:', user._id.toString());
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  Password Hash:', user.password);
      console.log('  Created:', user.createdAt);
      console.log('  Updated:', user.updatedAt);
    });
    
    if (users.length > 1) {
      console.log('\n⚠️ DUPLICATE USERS DETECTED!');
      console.log('This explains why login fails - multiple users with same email but different password hashes.');
      
      // Delete all but the most recent user
      const sortedUsers = users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const keepUser = sortedUsers[0];
      const deleteUsers = sortedUsers.slice(1);
      
      console.log(`\n🗑️ Keeping most recent user (${keepUser._id}) and deleting ${deleteUsers.length} older user(s)...`);
      
      for (const user of deleteUsers) {
        await User.findByIdAndDelete(user._id);
        console.log(`   ✅ Deleted user ${user._id}`);
      }
      
      console.log('\n✅ Cleanup complete. Only one user remains.');
    } else {
      console.log('\n✅ No duplicates found.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

checkDuplicateUsers();