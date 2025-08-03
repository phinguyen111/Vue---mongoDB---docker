const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Book = require('../models/BookModel');
const connectDB = require('../config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Kiểm tra database...');
    
    // Connect to database
    await connectDB();
    
    // Check users
    console.log('\n👥 USERS TRONG DATABASE:');
    console.log('=' .repeat(50));
    
    const users = await User.find({}).select('+password');
    
    if (users.length === 0) {
      console.log('❌ Không có user nào trong database!');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user._id}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Name: ${user.name}`);
        console.log(`   🔑 Role: ${user.role}`);
        console.log(`   🔒 Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD'}`);
        console.log(`   📅 Created: ${user.createdAt}`);
        console.log(`   🟢 Active: ${user.isActive}`);
        console.log(`   🕐 Last Login: ${user.lastLogin || 'Never'}`);
      });
    }
    
    // Check books
    console.log('\n\n📚 BOOKS TRONG DATABASE:');
    console.log('=' .repeat(50));
    
    const books = await Book.find({});
    
    if (books.length === 0) {
      console.log('❌ Không có book nào trong database!');
    } else {
      console.log(`✅ Tổng số books: ${books.length}`);
      books.slice(0, 3).forEach((book, index) => {
        console.log(`\n${index + 1}. ${book.title}`);
        console.log(`   👨‍💼 Author: ${book.author}`);
        console.log(`   📂 Category: ${book.category}`);
        console.log(`   ⭐ Rating: ${book.rating}`);
      });
      
      if (books.length > 3) {
        console.log(`\n   ... và ${books.length - 3} books khác`);
      }
    }
    
    // Database connection info
    console.log('\n\n🔗 THÔNG TIN KẾT NỐI:');
    console.log('=' .repeat(50));
    console.log(`📍 MongoDB URI: ${process.env.MONGODB_URI}`);
    console.log(`🏠 Database Name: ${mongoose.connection.db.databaseName}`);
    console.log(`🔌 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Summary
    console.log('\n\n📊 TỔNG KẾT:');
    console.log('=' .repeat(50));
    console.log(`👥 Total Users: ${users.length}`);
    console.log(`📚 Total Books: ${books.length}`);
    
    if (users.length > 0) {
      console.log('\n🔑 THÔNG TIN ĐĂNG NHẬP:');
      users.forEach(user => {
        const defaultPassword = user.role === 'admin' ? 'admin123' : 'user123';
        console.log(`   📧 ${user.email} / 🔒 ${defaultPassword}`);
      });
    }
    
    console.log('\n✅ Kiểm tra database hoàn tất!');
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã đóng kết nối database');
  }
}

// Run if called directly
if (require.main === module) {
  checkDatabase();
}

module.exports = checkDatabase;