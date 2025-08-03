const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAdminAPI() {
  try {
    console.log('🔐 Testing Admin Login...');
    
    // Test admin login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      const token = loginResponse.data.token;
      
      // Test get users (admin only)
      console.log('\n📋 Testing Get Users...');
      const usersResponse = await axios.get(`${BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (usersResponse.data.success) {
        console.log('✅ Get users successful');
        console.log(`Found ${usersResponse.data.users.length} users`);
      } else {
        console.log('❌ Get users failed:', usersResponse.data.message);
      }
      
      // Test get books
      console.log('\n📚 Testing Get Books...');
      const booksResponse = await axios.get(`${BASE_URL}/books`);
      
      if (booksResponse.data.success) {
        console.log('✅ Get books successful');
        console.log(`Found ${booksResponse.data.books.length} books`);
      } else {
        console.log('❌ Get books failed:', booksResponse.data.message);
      }
      
      // Test create book (admin only)
      console.log('\n➕ Testing Create Book...');
      const createBookResponse = await axios.post(`${BASE_URL}/books`, {
        title: 'Test Book',
        author: 'Test Author',
        category: 'Technology',
        year: 2024,
        description: 'Test description',
        isbn: '1234567890',
        publisher: 'Test Publisher',
        pages: 200,
        language: 'Vietnamese'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (createBookResponse.data.success) {
        console.log('✅ Create book successful');
        const bookId = createBookResponse.data.book._id;
        
        // Test delete book
        console.log('\n🗑️ Testing Delete Book...');
        const deleteBookResponse = await axios.delete(`${BASE_URL}/books/${bookId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (deleteBookResponse.data.success) {
          console.log('✅ Delete book successful');
        } else {
          console.log('❌ Delete book failed:', deleteBookResponse.data.message);
        }
      } else {
        console.log('❌ Create book failed:', createBookResponse.data.message);
      }
      
    } else {
      console.log('❌ Admin login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testAdminAPI();