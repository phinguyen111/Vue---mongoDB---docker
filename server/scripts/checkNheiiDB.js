const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Book = require('../models/BookModel');

async function checkNheiiDatabase() {
  try {
    console.log('🔍 Kiểm tra database NHEII...');
    
    // Connect to database using .env config
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ Kết nối thành công: ${process.env.MONGODB_URI}`);
    console.log(`🏠 Database Name: ${mongoose.connection.db.databaseName}`);
    
    // Check users - get latest 5
    console.log('\n👥 USERS MỚI NHẤT (5 users):');
    console.log('=' .repeat(50));
    
    const users = await User.find({}).sort({ createdAt: -1 }).limit(5).select('+password');
    
    if (users.length === 0) {
      console.log('❌ Không có user nào trong database!');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user._id}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Name: ${user.name}`);
        console.log(`   🔑 Role: ${user.role}`);
        console.log(`   📅 Created: ${user.createdAt}`);
        console.log(`   🟢 Active: ${user.isActive}`);
        if (user.lastLogin) {
          console.log(`   🕐 Last Login: ${user.lastLogin}`);
        }
      });
    }
    
    // Total count
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    
    console.log('\n📊 TỔNG KẾT:');
    console.log('=' .repeat(50));
    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`📚 Total Books: ${totalBooks}`);
    
    await mongoose.connection.close();
    console.log('\n🔌 Đã đóng kết nối database');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  checkNheiiDatabase();
}

module.exports = checkNheiiDatabase;