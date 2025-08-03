require('dotenv').config();
const bcrypt = require('bcryptjs');

async function testReversePassword() {
  console.log('🔍 Trying to find what password created this hash');
  
  const dbHash = '$2a$10$y7pF45hyLCA.JAxk7pP29OY6jFUD7.MOJBI9FQDK2n4HS8EMB7.li';
  
  // Common passwords to test
  const passwords = [
    'password123',
    'Password123',
    'PASSWORD123',
    'password',
    'Password',
    'PASSWORD',
    '123456',
    'admin',
    'test',
    'user',
    'direct@test.com',
    'Test User Direct',
    'testuser',
    'TestUser',
    'test123',
    'Test123',
    'TEST123',
    '',
    ' ',
    'undefined',
    'null',
    '[object Object]',
    'password123\n',
    'password123\r\n'
  ];
  
  console.log('Testing', passwords.length, 'common passwords...');
  
  for (const password of passwords) {
    try {
      const result = await bcrypt.compare(password, dbHash);
      if (result) {
        console.log('✅ FOUND MATCH!');
        console.log('Password:', JSON.stringify(password));
        console.log('Length:', password.length);
        console.log('Bytes:', Buffer.from(password).toString('hex'));
        return;
      }
    } catch (error) {
      console.log('Error testing password:', JSON.stringify(password), error.message);
    }
  }
  
  console.log('❌ No matching password found');
  
  // Let's also check if the hash is valid
  console.log('\n🔍 Checking hash validity...');
  try {
    // Try to create a hash and compare with itself
    const testHash = await bcrypt.hash('test', 10);
    const testResult = await bcrypt.compare('test', testHash);
    console.log('Test hash creation works:', testResult);
    
    // Check if the database hash format is correct
    console.log('Database hash format check:');
    console.log('Length:', dbHash.length);
    console.log('Starts with $2a$10$:', dbHash.startsWith('$2a$10$'));
    console.log('Has correct structure:', /^\$2[aby]\$\d+\$[./A-Za-z0-9]{53}$/.test(dbHash));
    
  } catch (error) {
    console.error('Hash validation error:', error.message);
  }
}

testReversePassword();