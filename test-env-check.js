const axios = require('axios');

const BASE_URL = 'https://vue-mongo-db-docker.vercel.app';

async function testEnvironmentCheck() {
  console.log('🔍 Testing Environment Variables Status...');
  console.log('=' .repeat(60));
  
  try {
    console.log('\n1. Checking /api/test endpoint...');
    const response = await axios.get(`${BASE_URL}/api/test`, {
      timeout: 10000
    });
    
    console.log('✅ Environment check result:');
    console.log(JSON.stringify(response.data, null, 2));
    
    const env = response.data.environment;
    if (!env.hasMongoUri) {
      console.log('\n⚠️  MONGODB_URI is missing!');
      console.log('   This will cause database connection errors.');
    }
    
    if (!env.hasJwtSecret) {
      console.log('\n⚠️  JWT_SECRET is missing!');
      console.log('   This will cause JWT token generation errors.');
    }
    
    if (!env.hasMongoUri || !env.hasJwtSecret) {
      console.log('\n🔧 To fix this:');
      console.log('1. Run: node generate-vercel-secrets.js');
      console.log('2. Go to: https://vercel.com/dashboard');
      console.log('3. Select project: vue-mongo-db-docker');
      console.log('4. Go to: Settings > Environment Variables');
      console.log('5. Add the missing variables');
      console.log('6. Redeploy the project');
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Environment check failed:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Environment check error:', error.message);
    }
  }
}

// Test a simple GET request to see if basic API works
async function testBasicAPI() {
  console.log('\n🔍 Testing Basic API Functionality...');
  console.log('=' .repeat(60));
  
  try {
    console.log('\n1. Testing /api/books (GET)...');
    const response = await axios.get(`${BASE_URL}/api/books`, {
      timeout: 10000
    });
    
    console.log('✅ Books API working:');
    console.log('Status:', response.status);
    console.log('Books count:', response.data.length || 0);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Books API failed:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Books API error:', error.message);
    }
  }
}

async function main() {
  await testEnvironmentCheck();
  await testBasicAPI();
  console.log('\n🏁 Environment and API testing completed!');
}

main().catch(console.error);