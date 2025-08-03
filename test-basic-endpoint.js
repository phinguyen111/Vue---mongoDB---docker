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
    
    req.end();
  });
}

async function testBasicEndpoints() {
  console.log('🔍 Testing Basic Endpoints...');
  console.log('============================================================');

  try {
    // Test 1: Test endpoint
    console.log('\n1. Testing /api/test...');
    const testResponse = await makeRequest(`${BASE_URL}/api/test`);
    console.log(`Status: ${testResponse.status}`);
    console.log('Response:', JSON.stringify(testResponse.data, null, 2));

    // Test 2: Books endpoint
    console.log('\n2. Testing /api/books...');
    const booksResponse = await makeRequest(`${BASE_URL}/api/books`);
    console.log(`Status: ${booksResponse.status}`);
    if (booksResponse.status === 200) {
      console.log(`Books count: ${booksResponse.data.length}`);
    } else {
      console.log('Response:', JSON.stringify(booksResponse.data, null, 2));
    }

    // Test 3: Auth endpoint with OPTIONS
    console.log('\n3. Testing /api/auth OPTIONS...');
    const authOptionsResponse = await makeRequest(`${BASE_URL}/api/auth`, {
      method: 'OPTIONS'
    });
    console.log(`Status: ${authOptionsResponse.status}`);
    console.log('CORS Headers:', {
      'access-control-allow-origin': authOptionsResponse.headers['access-control-allow-origin'],
      'access-control-allow-methods': authOptionsResponse.headers['access-control-allow-methods']
    });

    // Test 4: Auth endpoint with GET (should return 405)
    console.log('\n4. Testing /api/auth GET (should be 405)...');
    const authGetResponse = await makeRequest(`${BASE_URL}/api/auth`);
    console.log(`Status: ${authGetResponse.status}`);
    console.log('Response:', JSON.stringify(authGetResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Basic endpoint testing completed!');
}

// Run the test
testBasicEndpoints();