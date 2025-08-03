#!/usr/bin/env node

/**
 * Generate a secure JWT secret for production deployment
 * Usage: node generate-jwt-secret.js
 */

const crypto = require('crypto');

// Generate a 32-byte random string in hex format
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 Generated JWT Secret for Production:');
console.log('=' .repeat(60));
console.log(jwtSecret);
console.log('=' .repeat(60));
console.log('\n📋 Instructions:');
console.log('1. Copy the JWT secret above');
console.log('2. Go to your Vercel project dashboard');
console.log('3. Navigate to Settings → Environment Variables');
console.log('4. Add a new variable:');
console.log('   - Name: JWT_SECRET');
console.log('   - Value: [paste the secret above]');
console.log('   - Environment: Production (and Preview if needed)');
console.log('\n⚠️  Important: Keep this secret secure and never commit it to your repository!');
console.log('\n🚀 After setting up environment variables, deploy with:');
console.log('   vercel --prod');
console.log('\n');