require('dotenv').config();
const bcrypt = require('bcryptjs');

async function testBcryptSalt12() {
  console.log('🧪 Testing bcrypt with salt 12');
  
  const plainPassword = 'password123';
  
  try {
    // Create hash with salt 12 (like in registration)
    console.log('\n🔍 Creating hash with salt 12...');
    const hash12 = await bcrypt.hash(plainPassword, 12);
    console.log('Hash with salt 12:', hash12);
    
    // Test comparison
    const result = await bcrypt.compare(plainPassword, hash12);
    console.log('Comparison result:', result);
    
    // Test with latest database hash
    console.log('\n🔍 Testing with latest database hash...');
    const latestDbHash = '$2a$10$y7pF45hyLCA.JAxk7pP29OY6jFUD7.MOJBI9FQDK2n4HS8EMB7.li';
    const latestResult = await bcrypt.compare(plainPassword, latestDbHash);
    console.log('Latest database hash result:', latestResult);
    
    // Test with old database hash
    console.log('\n🔍 Testing with old database hash...');
    const oldDbHash = '$2a$10$JueIkjx.YYCcuXIAmACiwuJ4JLh6FFfxwtx/Zi5uF9Kc0OToCGOQq';
    const oldResult = await bcrypt.compare(plainPassword, oldDbHash);
    console.log('Old database hash result:', oldResult);
    
    // Test with different passwords
    console.log('\n🔍 Testing with different passwords...');
    const wrongResult = await bcrypt.compare('wrongpassword', hash12);
    console.log('Wrong password result:', wrongResult);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBcryptSalt12();