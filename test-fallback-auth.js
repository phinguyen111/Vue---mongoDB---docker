const https = require('https');

// Test configuration
const BASE_URL = 'https://nheii.vercel.app';
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'testpassword123'
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testFallbackAuth() {
  console.log('🧪 Testing Fallback Authentication System...');
  console.log('============================================================');
  
  try {
    // Test 1: Register a new user
    console.log('\n1. Testing User Registration (Fallback Mode)...');
    const registerResponse = await makeRequest(`${BASE_URL}/api/auth?action=register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(TEST_USER)
    });
    
    console.log(`Status: ${registerResponse.status}`);
    console.log('Response:', JSON.stringify(registerResponse.data, null, 2));
    
    if (registerResponse.status === 201) {
      console.log('✅ Registration successful!');
      
      // Test 2: Login with the same user
      console.log('\n2. Testing User Login (Fallback Mode)...');
      const loginResponse = await makeRequest(`${BASE_URL}/api/auth?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: TEST_USER.password
        })
      });
      
      console.log(`Status: ${loginResponse.status}`);
      console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
      
      if (loginResponse.status === 200) {
        console.log('✅ Login successful!');
        
        // Test 3: Try to register the same user again (should fail)
        console.log('\n3. Testing Duplicate Registration (Should Fail)...');
        const duplicateResponse = await makeRequest(`${BASE_URL}/api/auth?action=register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(TEST_USER)
        });
        
        console.log(`Status: ${duplicateResponse.status}`);
        console.log('Response:', JSON.stringify(duplicateResponse.data, null, 2));
        
        if (duplicateResponse.status === 400) {
          console.log('✅ Duplicate registration properly rejected!');
        } else {
          console.log('❌ Duplicate registration should have been rejected');
        }
        
        // Test 4: Try login with wrong password
        console.log('\n4. Testing Login with Wrong Password (Should Fail)...');
        const wrongPasswordResponse = await makeRequest(`${BASE_URL}/api/auth?action=login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: TEST_USER.email,
            password: 'wrongpassword'
          })
        });
        
        console.log(`Status: ${wrongPasswordResponse.status}`);
        console.log('Response:', JSON.stringify(wrongPasswordResponse.data, null, 2));
        
        if (wrongPasswordResponse.status === 400) {
          console.log('✅ Wrong password properly rejected!');
        } else {
          console.log('❌ Wrong password should have been rejected');
        }
        
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Registration failed');
    }
    
    // Test 5: Check environment status
    console.log('\n5. Checking Environment Status...');
    const envResponse = await makeRequest(`${BASE_URL}/api/test`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Status: ${envResponse.status}`);
    console.log('Environment:', JSON.stringify(envResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
  
  console.log('\n🏁 Fallback authentication testing completed!');
}

// Run the test
testFallbackAuth();