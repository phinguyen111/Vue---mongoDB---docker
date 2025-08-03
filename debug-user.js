require('dotenv').config();
const User = require('./server/models/User');
const connectDB = require('./server/config/database');

async function debugUser() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    const user = await User.findOne({ email: 'direct@test.com' }).select('+password');
    if (user) {
      console.log('👤 User found:');
      console.log('  ID:', user._id);
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  Password hash:', user.password ? 'exists' : 'missing');
      console.log('  Password length:', user.password ? user.password.length : 'N/A');
      console.log('  Full user object:', JSON.stringify(user, null, 2));
    } else {
      console.log('❌ User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugUser();