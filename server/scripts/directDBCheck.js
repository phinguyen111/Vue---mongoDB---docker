const { MongoClient } = require('mongodb');
require('dotenv').config();

async function directDatabaseCheck() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🔍 KIỂM TRA TRỰC TIẾP MONGODB DATABASE');
    console.log('=' .repeat(50));
    
    // Connect trực tiếp
    await client.connect();
    console.log('✅ Kết nối MongoDB thành công');
    
    const db = client.db(process.env.DB_NAME || 'digital_library');
    
    // Liệt kê tất cả collections
    console.log('\n📁 COLLECTIONS TRONG DATABASE:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Kiểm tra users collection
    console.log('\n👥 USERS COLLECTION:');
    console.log('-' .repeat(30));
    
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`📊 Tổng số users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await usersCollection.find({}).toArray();
      
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user._id}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Name: ${user.name}`);
        console.log(`   🔑 Role: ${user.role || 'user'}`);
        console.log(`   🔒 Password: ${user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD'}`);
        console.log(`   📅 Created: ${user.createdAt || 'Unknown'}`);
        console.log(`   🟢 Active: ${user.isActive !== undefined ? user.isActive : 'Unknown'}`);
        console.log(`   🕐 Last Login: ${user.lastLogin || 'Never'}`);
      });
      
      // Tìm user mới nhất
      const latestUser = await usersCollection.findOne({}, { sort: { _id: -1 } });
      console.log('\n🆕 USER MỚI NHẤT:');
      console.log(`   📧 ${latestUser.email}`);
      console.log(`   👤 ${latestUser.name}`);
      console.log(`   📅 ${latestUser.createdAt || 'Unknown'}`);
    }
    
    // Kiểm tra books collection
    console.log('\n\n📚 BOOKS COLLECTION:');
    console.log('-' .repeat(30));
    
    const booksCollection = db.collection('books');
    const bookCount = await booksCollection.countDocuments();
    console.log(`📊 Tổng số books: ${bookCount}`);
    
    if (bookCount > 0) {
      const books = await booksCollection.find({}).limit(3).toArray();
      books.forEach((book, index) => {
        console.log(`\n${index + 1}. ${book.title}`);
        console.log(`   👨‍💼 Author: ${book.author}`);
        console.log(`   📂 Category: ${book.category}`);
      });
      
      if (bookCount > 3) {
        console.log(`\n   ... và ${bookCount - 3} books khác`);
      }
    }
    
    // Database stats
    console.log('\n\n📊 THỐNG KÊ DATABASE:');
    console.log('=' .repeat(50));
    console.log(`🏠 Database: ${db.databaseName}`);
    console.log(`👥 Total Users: ${userCount}`);
    console.log(`📚 Total Books: ${bookCount}`);
    
    // Kiểm tra indexes
    console.log('\n🔍 INDEXES:');
    const userIndexes = await usersCollection.indexes();
    console.log(`   Users collection có ${userIndexes.length} indexes`);
    
    console.log('\n✅ Kiểm tra database hoàn tất!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Đã đóng kết nối');
  }
}

// Run if called directly
if (require.main === module) {
  directDatabaseCheck();
}

module.exports = directDatabaseCheck;