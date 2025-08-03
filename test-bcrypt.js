require('dotenv').config();
const bcrypt = require('bcryptjs');

async function testBcrypt() {
  console.log('🧪 Testing bcrypt functionality');
  
  const plainPassword = 'password123';
  const existingHash = '$2a$10$Z236ccJIHag1yjNNYfeUOee5WnFOpkv/DCTZLuDlu8qW7vht7J.ly';
  
  console.log('Plain password:', plainPassword);
  console.log('Existing hash:', existingHash);
  
  try {
    // Test with existing hash (new user)
    console.log('\n🔍 Testing new user hash...');
    const result1 = await bcrypt.compare(plainPassword, existingHash);
    console.log('Result with new user hash:', result1);
    
    // Test with old hash
    console.log('\n🔍 Testing old user hash...');
    const oldHash = '$2a$10$ZB1cYqi6mXAf0CmrssKFJOwycb/4eT6XMLmuX9giHUi5kweFC1.Xi';
    const result1b = await bcrypt.compare(plainPassword, oldHash);
    console.log('Result with old user hash:', result1b);
    
    // Create new hash and test
    console.log('\n🔍 Creating new hash...');
    const newHash = await bcrypt.hash(plainPassword, 10);
    console.log('New hash:', newHash);
    
    const result2 = await bcrypt.compare(plainPassword, newHash);
    console.log('Result with new hash:', result2);
    
    // Test with wrong password
    console.log('\n🔍 Testing wrong password...');
    const result3 = await bcrypt.compare('wrongpassword', existingHash);
    console.log('Result with wrong password:', result3);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBcrypt();