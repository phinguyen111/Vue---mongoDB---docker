const axios = require('axios');

const BASE_URL = 'https://vue-mongo-db-docker.vercel.app';

async function testDirectAuth() {
  console.log('🔍 Testing Direct Auth Endpoint...');
  console.log('=' .repeat(60));
  
  // Test 1: Direct auth.js endpoint
  try {
    console.log('\n1. Testing /api/auth.js directly...');
    const response = await axios.post(`${BASE_URL}/api/auth.js`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Direct auth.js successful:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Direct auth.js failed:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Direct auth.js error:', error.message);
    }
  }
  
  // Test 2: Auth with action parameter
  try {
    console.log('\n2. Testing /api/auth.js?action=register...');
    const response = await axios.post(`${BASE_URL}/api/auth.js?action=register`, {
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Auth with action successful:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Auth with action failed:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Auth with action error:', error.message);
    }
  }
  
  // Test 3: Check what methods are allowed
  try {
    console.log('\n3. Testing OPTIONS request...');
    const response = await axios.options(`${BASE_URL}/api/auth.js`, {
      timeout: 10000
    });
    
    console.log('✅ OPTIONS successful:');
    console.log('Headers:', response.headers);
    
  } catch (error) {
    console.log('❌ OPTIONS failed:', error.message);
  }
}

async function main() {
  await testDirectAuth();
  console.log('\n🏁 Direct auth testing completed!');
}

main().catch(console.error);