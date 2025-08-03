require('dotenv').config();
const bcrypt = require('bcryptjs');

async function testExactPassword() {
  console.log('🧪 Testing exact password from request');
  
  // Exact password from test request
  const requestPassword = 'password123';
  const registerHash = '$2a$10$OGWQX3NTu9JmLQSkAt8nleT7Vuvyq.WE8fzxmg2ZtUUkRsVGoaZTe';
  const loginHash = '$2a$10$IOthqbrK0tvW5H8RSkWSRe5pCIlC3bQGrta28ucDcTPXzdSqjF1HC';
  
  console.log('Request password:', JSON.stringify(requestPassword));
  console.log('Request password length:', requestPassword.length);
    console.log('Request password bytes:', Buffer.from(requestPassword).toString('hex'));
    console.log('Register hash:', registerHash);
    console.log('Login hash:', loginHash);
  
  try {
    // Test direct comparison with register hash
    console.log('\n🔍 Direct comparison with register hash...');
    const registerResult = await bcrypt.compare(requestPassword, registerHash);
    console.log('Register hash result:', registerResult);
    
    // Test direct comparison with login hash
    console.log('\n🔍 Direct comparison with login hash...');
    const loginResult = await bcrypt.compare(requestPassword, loginHash);
    console.log('Login hash result:', loginResult);
    
    // Test creating new hash with same password
    console.log('\n🔍 Creating new hash with same password...');
    const newHash = await bcrypt.hash(requestPassword, 10);
    console.log('New hash:', newHash);
    
    const newHashResult = await bcrypt.compare(requestPassword, newHash);
    console.log('New hash result:', newHashResult);
    
    // Test with trimmed password
    console.log('\n🔍 Testing with trimmed password...');
    const trimmedPassword = requestPassword.trim();
    const trimmedResult = await bcrypt.compare(trimmedPassword, loginHash);
    console.log('Trimmed result:', trimmedResult);
    
    // Test different variations
    console.log('\n🔍 Testing variations...');
    const variations = [
      'password123',
      'password123\n',
      'password123\r',
      'password123\r\n',
      ' password123',
      'password123 '
    ];
    
    for (const variation of variations) {
      const result = await bcrypt.compare(variation, loginHash);
      console.log(`'${variation.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}': ${result}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testExactPassword();