// Load environment variables
require('dotenv').config();

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const VERCEL_URL = 'https://nheii.vercel.app';

// Test data
const testUser = {
  name: 'Test User New',
  email: 'testuser@example.com',
  password: 'password123'
};

const mockUser = {
  email: 'test@example.com',
  password: 'password123'
};

async function testAuthModes() {
  console.log('🧪 Testing Auth API Modes');
  console.log('=' .repeat(60));

  // Test 1: Check environment variables
  console.log('\n📋 1. Environment Variables Check:');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');

  // Test 2: Local server test
  console.log('\n🏠 2. Local Server Test:');
  try {
    // Test health endpoint
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('Health check:', healthResponse.data.status);
    console.log('Mock mode:', healthResponse.data.mockMode ? '🔧 ENABLED' : '🔗 DISABLED');

    // Test mock user login
    console.log('\n🔐 Testing Mock User Login:');
    const mockLoginResponse = await axios.post(`${BASE_URL}/api/auth`, {
      action: 'login',
      email: mockUser.email,
      password: mockUser.password
    });
    console.log('Mock login result:', mockLoginResponse.data.message);
    console.log('Token received:', mockLoginResponse.data.token ? '✅ Yes' : '❌ No');

    // Test new user registration
    console.log('\n📝 Testing New User Registration:');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth`, {
        action: 'register',
        name: testUser.name,
        email: testUser.email,
        password: testUser.password
      });
      console.log('Registration result:', registerResponse.data.message);
      console.log('Token received:', registerResponse.data.token ? '✅ Yes' : '❌ No');

      // Test login with newly registered user
      console.log('\n🔑 Testing Login with New User:');
      const newUserLoginResponse = await axios.post(`${BASE_URL}/api/auth`, {
        action: 'login',
        email: testUser.email,
        password: testUser.password
      });
      console.log('New user login result:', newUserLoginResponse.data.message);
      console.log('Token received:', newUserLoginResponse.data.token ? '✅ Yes' : '❌ No');
    } catch (regError) {
      console.log('Registration error:', regError.response?.data?.error?.message || regError.message);
    }

  } catch (localError) {
    console.log('❌ Local server error:', localError.message);
    console.log('Make sure to run: node test-local-server.js');
  }

  // Test 3: Vercel deployment test
  console.log('\n☁️ 3. Vercel Deployment Test:');
  try {
    const vercelTestResponse = await axios.get(`${VERCEL_URL}/api/test`);
    console.log('Vercel API status:', vercelTestResponse.data.message);
    
    // Test Vercel auth
    const vercelAuthResponse = await axios.post(`${VERCEL_URL}/api/auth`, {
      action: 'login',
      email: mockUser.email,
      password: mockUser.password
    });
    console.log('Vercel auth result:', vercelAuthResponse.data.message);
  } catch (vercelError) {
    console.log('❌ Vercel error:', vercelError.response?.data?.message || vercelError.message);
    if (vercelError.response?.status === 404) {
      console.log('🔧 This indicates Vercel deployment issues or missing environment variables');
    }
  }

  // Test 4: Environment file analysis
  console.log('\n📁 4. Environment Files Analysis:');
  const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
  
  envFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`${file}: ✅ Exists`);
      const content = fs.readFileSync(filePath, 'utf8');
      const hasMongoUri = content.includes('MONGODB_URI=');
      const hasJwtSecret = content.includes('JWT_SECRET=');
      console.log(`  - MONGODB_URI: ${hasMongoUri ? '✅' : '❌'}`);
      console.log(`  - JWT_SECRET: ${hasJwtSecret ? '✅' : '❌'}`);
    } else {
      console.log(`${file}: ❌ Missing`);
    }
  });

  console.log('\n🔧 Recommendations:');
  console.log('=' .repeat(60));
  
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.log('❌ MOCK MODE is active because environment variables are missing');
    console.log('\n📋 To fix this:');
    console.log('1. For LOCAL development:');
    console.log('   - Use: NODE_ENV=development node test-local-server.js');
    console.log('   - Or copy .env.local to .env');
    console.log('\n2. For VERCEL deployment:');
    console.log('   - Go to https://vercel.com/dashboard');
    console.log('   - Select project: nheii');
    console.log('   - Settings > Environment Variables');
    console.log('   - Add: MONGODB_URI, JWT_SECRET, NODE_ENV=production');
    console.log('   - Redeploy the project');
  } else {
    console.log('✅ Environment variables are properly configured');
    console.log('✅ Should be running in PRODUCTION mode with MongoDB');
  }

  console.log('\n🎯 Mock User Credentials for Testing:');
  console.log('Email: test@example.com');
  console.log('Password: password123');
}

// Run the test
testAuthModes().catch(console.error);