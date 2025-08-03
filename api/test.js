// Test endpoint to verify environment variables
// This is a temporary endpoint for debugging
// Remove after confirming environment variables are working

// Load environment variables
require('dotenv').config();

module.exports = function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://nheii.vercel.app',
    'https://nheii-git-main-phingunens-projects.vercel.app',
    'https://nheii-phingunens-projects.vercel.app'
  ];
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables without exposing their values
    const envCheck = {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
      mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      message: 'Environment variables check',
      environment: envCheck,
      status: envCheck.hasMongoUri && envCheck.hasJwtSecret ? 'OK' : 'MISSING_VARS'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};