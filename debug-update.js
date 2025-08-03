// Debug script to test update operations with detailed logging
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function debugUpdate() {
  try {
    console.log('🔐 Logging in as admin...');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test Book Update
    console.log('\n📚 Testing Book Update...');
    
    // Get books first
    const booksResponse = await axios.get(`${BASE_URL}/books`, { headers });
    const books = Array.isArray(booksResponse.data) ? booksResponse.data : booksResponse.data.books || [];
    
    if (books.length > 0) {
      const book = books[0];
      console.log('📖 Original book:', {
        id: book._id,
        title: book.title,
        author: book.author,
        category: book.category,
        language: book.language
      });
      
      const updateData = {
        title: book.title + ' (Debug Update)',
        author: book.author,
        category: book.category,
        language: book.language,
        description: book.description + ' - Debug update test',
        price: book.price,
        stock: book.stock,
        isbn: book.isbn,
        publisher: book.publisher,
        pages: book.pages,
        year: book.year
      };
      
      console.log('📝 Update data being sent:', updateData);
      
      try {
        const updateResponse = await axios.put(
          `${BASE_URL}/books/${book._id}`, 
          updateData, 
          { headers }
        );
        
        console.log('✅ Book update response:', {
          status: updateResponse.status,
          success: updateResponse.data.success,
          message: updateResponse.data.message,
          updatedTitle: updateResponse.data.book?.title
        });
        
        // Verify the update by fetching the book again
        const verifyResponse = await axios.get(`${BASE_URL}/books/${book._id}`, { headers });
        console.log('🔍 Verification - Updated book title:', verifyResponse.data.book?.title);
        
      } catch (updateError) {
        console.error('❌ Book update failed:');
        console.error('Status:', updateError.response?.status);
        console.error('Response data:', updateError.response?.data);
        console.error('Error message:', updateError.message);
      }
    }
    
    // Test User Update
    console.log('\n👥 Testing User Update...');
    
    const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
    const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.users || [];
    
    const nonAdminUser = users.find(u => u.email !== 'admin@example.com');
    
    if (nonAdminUser) {
      console.log('👤 Original user:', {
        id: nonAdminUser._id,
        name: nonAdminUser.name,
        email: nonAdminUser.email,
        role: nonAdminUser.role,
        isActive: nonAdminUser.isActive
      });
      
      const updateUserData = {
        name: nonAdminUser.name + ' (Debug Update)',
        email: nonAdminUser.email,
        role: nonAdminUser.role,
        isActive: nonAdminUser.isActive
      };
      
      console.log('📝 User update data being sent:', updateUserData);
      
      try {
        const updateUserResponse = await axios.put(
          `${BASE_URL}/users/${nonAdminUser._id}`, 
          updateUserData, 
          { headers }
        );
        
        console.log('✅ User update response:', {
          status: updateUserResponse.status,
          success: updateUserResponse.data.success,
          message: updateUserResponse.data.message,
          updatedName: updateUserResponse.data.user?.name
        });
        
        // Verify the update
        const verifyUserResponse = await axios.get(`${BASE_URL}/users/${nonAdminUser._id}`, { headers });
        console.log('🔍 Verification - Updated user name:', verifyUserResponse.data.user?.name);
        
      } catch (updateError) {
        console.error('❌ User update failed:');
        console.error('Status:', updateError.response?.status);
        console.error('Response data:', updateError.response?.data);
        console.error('Error message:', updateError.message);
      }
    }
    
    console.log('\n🎉 Debug test completed!');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

debugUpdate();