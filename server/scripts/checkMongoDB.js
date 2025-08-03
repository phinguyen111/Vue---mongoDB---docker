// Script để kiểm tra MongoDB trực tiếp
// Chạy với: mongosh nheii checkMongoDB.js

print('🔍 KIỂM TRA MONGODB DATABASE - NHEII');
print('=' .repeat(50));

// Kiểm tra users collection
print('\n👥 USERS COLLECTION:');
const users = db.users.find({}).toArray();
print(`Tổng số users: ${users.length}`);

users.forEach((user, index) => {
  print(`\n${index + 1}. User:`);
  print(`   📧 Email: ${user.email}`);
  print(`   👤 Name: ${user.name}`);
  print(`   🔑 Role: ${user.role}`);
  print(`   🔒 Password: ${user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD'}`);
  print(`   📅 Created: ${user.createdAt}`);
  print(`   🟢 Active: ${user.isActive}`);
  print(`   🕐 Last Login: ${user.lastLogin || 'Never'}`);
});

// Kiểm tra books collection
print('\n\n📚 BOOKS COLLECTION:');
const books = db.books.find({}).toArray();
print(`Tổng số books: ${books.length}`);

books.slice(0, 3).forEach((book, index) => {
  print(`\n${index + 1}. ${book.title}`);
  print(`   👨‍💼 Author: ${book.author}`);
  print(`   📂 Category: ${book.category}`);
});

if (books.length > 3) {
  print(`\n   ... và ${books.length - 3} books khác`);
}

// Thống kê database
print('\n\n📊 THỐNG KÊ DATABASE:');
print('=' .repeat(50));
print(`🏠 Database: ${db.getName()}`);
print(`👥 Users: ${users.length}`);
print(`📚 Books: ${books.length}`);

// Hiển thị collections
print('\n📁 Collections trong database:');
db.getCollectionNames().forEach(name => {
  const count = db.getCollection(name).countDocuments();
  print(`   - ${name}: ${count} documents`);
});

print('\n✅ Kiểm tra hoàn tất!');