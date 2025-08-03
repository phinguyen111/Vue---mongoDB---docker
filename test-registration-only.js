require('dotenv').config();
const axios = require('axios');

async function testRegistrationOnly() {
  console.log('🧪 Testing Registration Only');
  console.log('==================================================');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Delete existing user first
    console.log('\n1. 🗑️ Deleting existing user...');
    const mongoose = require('mongoose');
    const User = require('./server/models/User');
    const connectDB = require('./server/config/database');
    
    await connectDB();
    const deleteResult = await User.deleteOne({ email: 'regtest@test.com' });
    console.log('Delete result:', deleteResult.deletedCount > 0 ? 'Success' : 'User not found');
    await mongoose.connection.close();
    
    // Register new user
    console.log('\n2. 📝 Registering new user...');
    const registerResponse = await axios.post(`${baseURL}/api/auth?action=register`, {
      name: 'Registration Test User',
      email: 'regtest@test.com',
      password: 'testpass123'
    });
    
    console.log('✅ Registration successful!');
    console.log('Status:', registerResponse.status);
    console.log('Message:', registerResponse.data.message);
    console.log('User ID:', registerResponse.data.user?.id);
    console.log('Token received:', registerResponse.data.token ? '✅ Yes' : '❌ No');
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Registration failed:');
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testRegistrationOnly();