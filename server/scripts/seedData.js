const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Book = require('../models/BookModel');
const connectDB = require('../config/database');

// Sample users data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    role: 'user'
  }
];

// Sample books data
const sampleBooks = [
  {
    title: 'How to Win Friends and Influence People',
    author: 'Dale Carnegie',
    category: 'Psychology',
    year: 2018,
    description: 'A classic book on the art of communication and interpersonal skills.',
    isbn: '978-0-123456-78-9',
    publisher: 'Simon & Schuster',
    pages: 320,
    language: 'English',
    cover: '/placeholder.svg?height=300&width=200',
    rating: 4.5,
    featured: true,
    tags: ['communication', 'life skills', 'psychology']
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'History',
    year: 2020,
    description: 'The story of human evolution from prehistoric times to the modern era.',
    isbn: '978-0-123456-78-8',
    publisher: 'Harper',
    pages: 512,
    language: 'English',
    cover: '/placeholder.svg?height=300&width=200',
    rating: 4.8,
    featured: true,
    tags: ['history', 'evolution', 'humanity']
  },
  {
    title: 'I Am Gifted, So Are You!',
    author: 'Adam Khoo',
    category: 'Self Development',
    year: 2019,
    description: 'A guide to developing mindset and effective learning skills.',
    isbn: '978-0-123456-78-7',
    publisher: 'Marshall Cavendish',
    pages: 280,
    language: 'English',
    cover: '/placeholder.svg?height=300&width=200',
    rating: 4.2,
    featured: false,
    tags: ['learning', 'skills', 'personal development']
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    category: 'Fiction',
    year: 2017,
    description: 'A story about the journey to find treasure and the meaning of life.',
    isbn: '978-0-123456-78-6',
    publisher: 'HarperOne',
    pages: 256,
    language: 'English',
    cover: '/placeholder.svg?height=300&width=200',
    rating: 4.6,
    featured: true,
    tags: ['philosophy', 'journey', 'spiritual']
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self Development',
    year: 2021,
    description: 'A guide to building good habits and breaking bad ones.',
    isbn: '978-0-123456-78-5',
    publisher: 'Avery',
    pages: 350,
    language: 'English',
    cover: '/placeholder.svg?height=300&width=200',
    rating: 4.7,
    featured: true,
    tags: ['habits', 'productivity', 'personal development']
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Psychology',
    year: 2019,
    description: 'Exploring how the human mind works and makes decisions.',
    isbn: '978-0-123456-78-4',
    publisher: 'Farrar, Straus and Giroux',
    pages: 480,
    language: 'English',
    cover: '/placeholder.svg?height=300&width=200',
    rating: 4.4,
    featured: false,
    tags: ['psychology', 'thinking', 'cognition']
  },
  {
    title: 'The 7 Habits of Highly Effective People',
    author: 'Stephen R. Covey',
    category: 'Self Development',
    year: 2020,
    description: 'Seven habits of successful people.',
    isbn: '978-0-123456-78-3',
    publisher: 'Free Press',
    pages: 400,
    language: 'English',
    cover: '/placeholder.svg?height=300&width=200',
    rating: 4.3,
    featured: false,
    tags: ['success', 'leadership', 'effectiveness']
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Technology',
    year: 2021,
    description: 'A guide to writing clean and maintainable code.',
    isbn: '978-0-123456-78-2',
    publisher: 'Prentice Hall',
    pages: 464,
    language: 'English',
    cover: '/placeholder.svg?height=300&width=200',
    rating: 4.9,
    featured: true,
    tags: ['programming', 'clean code', 'software engineering']
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Bắt đầu seed database...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🗑️  Xóa dữ liệu cũ...');
    await User.deleteMany({});
    await Book.deleteMany({});
    
    // Create users (password will be hashed by User model pre-save middleware)
    console.log('👥 Tạo users...');
    const createdUsers = [];

    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Tạo user: ${user.email}`);
    }
    
    // Create books
    console.log('📚 Tạo books...');
    const createdBooks = [];
    
    for (const bookData of sampleBooks) {
      const book = new Book(bookData);
      await book.save();
      createdBooks.push(book);
      console.log(`✅ Tạo book: ${book.title}`);
    }
    
    // Add some sample reviews
    console.log('⭐ Thêm reviews mẫu...');
    const regularUsers = createdUsers.filter(user => user.role === 'user');
    
    for (let i = 0; i < Math.min(3, createdBooks.length); i++) {
      const book = createdBooks[i];
      const user = regularUsers[i % regularUsers.length];
      
      await book.addReview(
        user._id,
        Math.floor(Math.random() * 2) + 4, // Rating 4-5
        `Đây là một cuốn sách rất hay! Tôi đã học được nhiều điều từ cuốn sách này.`
      );
      
      console.log(`✅ Thêm review cho: ${book.title}`);
    }
    
    // Add some favorites and history
    console.log('❤️  Thêm favorites và history...');
    for (const user of regularUsers) {
      // Add 2-3 books to favorites
      const favoriteBooks = createdBooks.slice(0, 3);
      for (const book of favoriteBooks) {
        await user.addToFavorites(book._id);
      }
      
      // Add 3-5 books to history
      const historyBooks = createdBooks.slice(0, 5);
      for (const book of historyBooks) {
        await user.addToHistory(book._id);
      }
      
      console.log(`✅ Cập nhật favorites và history cho: ${user.email}`);
    }
    
    console.log('\n🎉 Seed database thành công!');
    console.log(`📊 Thống kê:`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Books: ${createdBooks.length}`);
    console.log(`   - Admin account: admin@example.com / admin123`);
    console.log(`   - User accounts: john@example.com / user123, jane@example.com / user123`);
    
  } catch (error) {
    console.error('❌ Lỗi khi seed database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối database');
    process.exit(0);
  }
}

// Run seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
