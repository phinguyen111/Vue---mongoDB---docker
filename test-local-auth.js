const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
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

async function testLocalAuth() {
  console.log('🧪 Testing Local Auth Server with Mock Mode...');
  console.log('============================================================');

  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await makeRequest(`${BASE_URL}/health`);
    console.log(`Status: ${healthResponse.status}`);
    console.log('Response:', JSON.stringify(healthResponse.data, null, 2));

    // Test 2: Environment check
    console.log('\n2. Testing environment check...');
    const envResponse = await makeRequest(`${BASE_URL}/api/test`);
    console.log(`Status: ${envResponse.status}`);
    console.log('Response:', JSON.stringify(envResponse.data, null, 2));

    // Test 3: Register new user
    console.log('\n3. Testing user registration...');
    const registerData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    };

    const registerResponse = await makeRequest(`${BASE_URL}/api/auth?action=register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData)
    });

    console.log(`Status: ${registerResponse.status}`);
    console.log('Response:', JSON.stringify(registerResponse.data, null, 2));

    if (registerResponse.status === 201) {
      console.log('✅ Registration successful!');
      
      // Test 4: Login with the registered user
      console.log('\n4. Testing user login...');
      const loginData = {
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const loginResponse = await makeRequest(`${BASE_URL}/api/auth?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      console.log(`Status: ${loginResponse.status}`);
      console.log('Response:', JSON.stringify(loginResponse.data, null, 2));

      if (loginResponse.status === 200) {
        console.log('✅ Login successful!');
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Registration failed');
    }

    // Test 5: Login with existing mock user
    console.log('\n5. Testing login with pre-existing mock user...');
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockLoginResponse = await makeRequest(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockLoginData)
    });

    console.log(`Status: ${mockLoginResponse.status}`);
    console.log('Response:', JSON.stringify(mockLoginResponse.data, null, 2));

    if (mockLoginResponse.status === 200) {
      console.log('✅ Mock user login successful!');
    } else {
      console.log('❌ Mock user login failed');
    }

    // Test 6: Test invalid credentials
    console.log('\n6. Testing invalid credentials...');
    const invalidLoginData = {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    };

    const invalidLoginResponse = await makeRequest(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidLoginData)
    });

    console.log(`Status: ${invalidLoginResponse.status}`);
    console.log('Response:', JSON.stringify(invalidLoginResponse.data, null, 2));

    if (invalidLoginResponse.status === 400) {
      console.log('✅ Invalid credentials properly rejected!');
    } else {
      console.log('❌ Invalid credentials test failed');
    }

    // Test 7: Test missing fields
    console.log('\n7. Testing missing fields validation...');
    const incompleteData = {
      email: 'test@example.com'
      // missing password
    };

    const incompleteResponse = await makeRequest(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incompleteData)
    });

    console.log(`Status: ${incompleteResponse.status}`);
    console.log('Response:', JSON.stringify(incompleteResponse.data, null, 2));

    if (incompleteResponse.status === 400) {
      console.log('✅ Missing fields properly validated!');
    } else {
      console.log('❌ Missing fields validation failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Local auth testing completed!');
  console.log('\n💡 If all tests passed, the mock mode is working correctly!');
  console.log('   The issue is likely with Vercel deployment, not the code.');
}

// Run the tests
testLocalAuth();