const https = require('https');

const BASE_URL = 'https://nheii.vercel.app';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testSimpleAuth() {
  console.log('🧪 Testing Simple Auth...');
  console.log('============================================================');

  try {
    // Test with minimal data
    console.log('\n1. Testing minimal registration...');
    const registerData = {
      name: 'Test',
      email: 'test@test.com',
      password: '123456'
    };

    const registerResponse = await makeRequest(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        ...registerData
      })
    });

    console.log(`Status: ${registerResponse.status}`);
    console.log('Response:', JSON.stringify(registerResponse.data, null, 2));

    // Test login with existing mock user
    console.log('\n2. Testing login with pre-existing mock user...');
    const loginData = {
      action: 'login',
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await makeRequest(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    console.log(`Status: ${loginResponse.status}`);
    console.log('Response:', JSON.stringify(loginResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Simple auth testing completed!');
}

// Run the test
testSimpleAuth();