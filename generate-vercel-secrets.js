const crypto = require('crypto');

console.log('🔐 Generating secrets for Vercel deployment...');
console.log('=' .repeat(60));

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📝 JWT_SECRET:');
console.log(jwtSecret);

// Generate example MongoDB URI
console.log('\n📝 MONGODB_URI (template):');
console.log('mongodb+srv://<username>:<password>@<cluster>.mongodb.net/digital_library_prod?retryWrites=true&w=majority');

console.log('\n📋 Copy these to Vercel Environment Variables:');
console.log('=' .repeat(60));
console.log('Variable Name: JWT_SECRET');
console.log('Value:', jwtSecret);
console.log('\nVariable Name: MONGODB_URI');
console.log('Value: [Replace with your MongoDB Atlas connection string]');
console.log('\nVariable Name: JWT_EXPIRES_IN');
console.log('Value: 7d');
console.log('\nVariable Name: NODE_ENV');
console.log('Value: production');

console.log('\n🚀 Next steps:');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Select your project: vue-mongo-db-docker');
console.log('3. Go to Settings > Environment Variables');
console.log('4. Add the variables above');
console.log('5. Redeploy your project');
console.log('\n✅ Done!');