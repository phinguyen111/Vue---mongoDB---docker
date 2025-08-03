const axios = require('axios');

const BASE_URL = 'https://vue-mongo-db-docker.vercel.app/api';

async function testRegistrationDetailed() {
  console.log('🔍 Testing Registration with Detailed Error Messages...');
  console.log('=' .repeat(60));
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Registration successful:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Registration failed with response:');
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('❌ No response received:', error.request);
    } else {
      console.log('❌ Error setting up request:', error.message);
    }
  }
}

// Also test direct auth endpoint
async function testAuthEndpoint() {
  console.log('\n🔍 Testing Auth Endpoint Directly...');
  console.log('=' .repeat(60));
  
  try {
    const response = await axios.post(`${BASE_URL}/auth?action=register`, {
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Auth endpoint successful:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Auth endpoint failed:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Auth endpoint error:', error.message);
    }
  }
}

async function main() {
  await testRegistrationDetailed();
  await testAuthEndpoint();
  console.log('\n🏁 Detailed testing completed!');
}

main().catch(console.error);