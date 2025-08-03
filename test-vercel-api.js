const axios = require('axios');

// Test script để kiểm tra API endpoints trên Vercel
// Thử nhiều URL có thể có
const POSSIBLE_URLS = [
  'https://nheii.vercel.app/api',
  'https://vue-mongo-db-docker.vercel.app/api',
  'https://vue-mongo-db-docker-git-main-phinguyen111.vercel.app/api'
];

let BASE_URL = POSSIBLE_URLS[0];

async function findWorkingURL() {
  console.log('🔍 Finding working Vercel deployment URL...');
  
  for (const url of POSSIBLE_URLS) {
    try {
      console.log(`\nTrying: ${url}`);
      const response = await axios.get(`${url}/test`, { timeout: 10000 });
      console.log('✅ Found working URL:', url);
      return url;
    } catch (error) {
      console.log('❌ Failed:', error.response?.status || error.code || error.message);
    }
  }
  
  console.log('\n❌ No working URL found!');
  return null;
}

async function testAPI() {
  console.log('🚀 Testing Vercel API Endpoints...');
  console.log('=' .repeat(50));
  
  // Find working URL first
  BASE_URL = await findWorkingURL();
  
  if (!BASE_URL) {
    console.log('\n🛑 Cannot proceed - no working deployment found!');
    return;
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📡 Testing API endpoints with:', BASE_URL);
  console.log('=' .repeat(50));

  // Test 1: Health check endpoint
  try {
    console.log('\n1. Testing health check...');
    const response = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Health check:', response.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.response?.data || error.message);
  }

  // Test 2: Get all books (public endpoint)
  try {
    console.log('\n2. Testing get all books...');
    const response = await axios.get(`${BASE_URL}/books`);
    console.log('✅ Get books:', response.data.success ? 'Success' : 'Failed');
    console.log('   Books count:', response.data.data?.length || 0);
  } catch (error) {
    console.log('❌ Get books failed:', error.response?.data || error.message);
  }

  // Test 3: Register new user
  try {
    console.log('\n3. Testing user registration...');
    const testUser = {
      name: 'Test User ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };
    
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ User registration:', response.data.success ? 'Success' : 'Failed');
    
    if (response.data.success) {
      // Test 4: Login with the new user
      try {
        console.log('\n4. Testing user login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✅ User login:', loginResponse.data.success ? 'Success' : 'Failed');
        
        if (loginResponse.data.success) {
          const token = loginResponse.data.token;
          
          // Test 5: Get user profile (protected endpoint)
          try {
            console.log('\n5. Testing get user profile...');
            const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            console.log('✅ Get profile:', profileResponse.data.success ? 'Success' : 'Failed');
          } catch (error) {
            console.log('❌ Get profile failed:', error.response?.data || error.message);
          }
        }
      } catch (error) {
        console.log('❌ User login failed:', error.response?.data || error.message);
      }
    }
  } catch (error) {
    console.log('❌ User registration failed:', error.response?.data || error.message);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🏁 API Testing completed!');
}

// Run the test
testAPI().catch(console.error);