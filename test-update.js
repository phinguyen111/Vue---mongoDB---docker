const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test admin login và update operations
async function testUpdateOperations() {
  try {
    console.log('🔐 Testing admin login...');
    
    // Login as admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Get all books
    console.log('\n📚 Getting all books...');
    const booksResponse = await axios.get(`${BASE_URL}/books`, { headers });
    console.log('Books response structure:', booksResponse.data);
    const books = Array.isArray(booksResponse.data) ? booksResponse.data : booksResponse.data.books || [];
    console.log(`✅ Found ${books.length} books`);
    
    if (books.length > 0) {
      const bookToUpdate = books[0];
      console.log(`\n📝 Testing book update for: ${bookToUpdate.title}`);
      
      // Test 2: Update book
      const updateBookData = {
        title: bookToUpdate.title + ' (Updated)',
        author: bookToUpdate.author,
        category: bookToUpdate.category,
        language: bookToUpdate.language,
        description: bookToUpdate.description + ' - Updated description',
        price: bookToUpdate.price,
        stock: bookToUpdate.stock
      };
      
      try {
        const updateBookResponse = await axios.put(
          `${BASE_URL}/books/${bookToUpdate._id}`, 
          updateBookData, 
          { headers }
        );
        console.log('✅ Book update successful:', updateBookResponse.data.title);
      } catch (updateError) {
        console.error('❌ Book update failed:');
        console.error('Status:', updateError.response?.status);
        console.error('Message:', updateError.response?.data?.message || updateError.message);
        console.error('Data sent:', updateBookData);
      }
    }
    
    // Test 3: Get all users
    console.log('\n👥 Getting all users...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
    console.log('Users response structure:', usersResponse.data);
    const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.users || [];
    console.log(`✅ Found ${users.length} users`);
    
    if (users.length > 1) { // Skip admin user
      const userToUpdate = users.find(u => u.email !== 'admin@example.com');
      if (userToUpdate) {
        console.log(`\n👤 Testing user update for: ${userToUpdate.email}`);
        
        // Test 4: Update user
        const updateUserData = {
          name: userToUpdate.name + ' (Updated)',
          email: userToUpdate.email,
          role: userToUpdate.role,
          isActive: userToUpdate.isActive
        };
        
        try {
          const updateUserResponse = await axios.put(
            `${BASE_URL}/users/${userToUpdate._id}`, 
            updateUserData, 
            { headers }
          );
          console.log('✅ User update successful:', updateUserResponse.data.name);
        } catch (updateError) {
          console.error('❌ User update failed:');
          console.error('Status:', updateError.response?.status);
          console.error('Message:', updateError.response?.data?.message || updateError.message);
          console.error('Data sent:', updateUserData);
        }
      }
    }
    
    console.log('\n🎉 Update operations test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testUpdateOperations();