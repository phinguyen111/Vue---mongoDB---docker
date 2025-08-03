const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  avatar: String,
  favorites: Array,
  history: Array,
  createdAt: Date,
  updatedAt: Date
});

async function checkAllUsers() {
  try {
    console.log('🔍 Kiểm tra tất cả users trong các database...');
    console.log('=' .repeat(60));
    
    // Kết nối đến digital_library
    console.log('\n📊 DATABASE: digital_library');
    const conn1 = await mongoose.createConnection('mongodb://localhost:27017/digital_library');
    const User1 = conn1.model('User', userSchema);
    
    const users1 = await User1.find({}).sort({ createdAt: -1 });
    console.log(`Tổng số users: ${users1.length}`);
    
    if (users1.length > 0) {
      console.log('\n👥 Danh sách users:');
      users1.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Active: ${user.isActive}`);
        console.log('   ---');
      });
    }
    
    await conn1.close();
    
    // Kết nối đến nheii
    console.log('\n📊 DATABASE: nheii');
    const conn2 = await mongoose.createConnection('mongodb://localhost:27017/nheii');
    const User2 = conn2.model('User', userSchema);
    
    const users2 = await User2.find({}).sort({ createdAt: -1 });
    console.log(`Tổng số users: ${users2.length}`);
    
    if (users2.length > 0) {
      console.log('\n👥 Danh sách users:');
      users2.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Active: ${user.isActive}`);
        console.log('   ---');
      });
    }
    
    await conn2.close();
    
    console.log('\n🎯 KẾT LUẬN:');
    console.log(`- Database 'digital_library': ${users1.length} users`);
    console.log(`- Database 'nheii': ${users2.length} users`);
    console.log('\n💡 KHUYẾN NGHỊ:');
    console.log('- Sử dụng database "digital_library" để xem tất cả users');
    console.log('- Trong MongoDB Compass: Chọn database "digital_library" > collection "users"');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAllUsers();