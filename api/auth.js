const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../server/models/User');
const connectDB = require('../server/config/database');

// Fallback in-memory storage for development/testing
let inMemoryUsers = [];
let userIdCounter = 1;

// Check if we're in fallback mode (missing environment variables)
function isFallbackMode() {
  return !process.env.MONGODB_URI || !process.env.JWT_SECRET;
}

// Fallback user operations
function createFallbackUser(userData) {
  const user = {
    _id: userIdCounter++,
    ...userData,
    createdAt: new Date(),
    lastLogin: null
  };
  inMemoryUsers.push(user);
  return user;
}

function findFallbackUser(email) {
  return inMemoryUsers.find(user => user.email === email);
}

// Generate a simple token for fallback mode
function generateFallbackToken(user) {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// CORS helper
function setCorsHeaders(res) {
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
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// Register function
async function handleRegister(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: { 
          code: '400', 
          message: 'Name, email, and password are required' 
        } 
      });
    }

    // Check if we're in fallback mode
    if (isFallbackMode()) {
      console.log('🔄 Running in fallback mode (missing environment variables)');
      
      // Check if user already exists in memory
      const existingUser = findFallbackUser(email);
      if (existingUser) {
        return res.status(400).json({ 
          error: { 
            code: '400', 
            message: 'User already exists' 
          } 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user in memory
      const user = createFallbackUser({
        name,
        email,
        password: hashedPassword,
        role: 'user'
      });

      // Generate fallback token
      const token = generateFallbackToken(user);

      return res.status(201).json({
        message: 'User created successfully (fallback mode)',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        warning: 'Running in fallback mode. Please configure MONGODB_URI and JWT_SECRET for production.'
      });
    }

    // Normal database mode
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: { 
          code: '400', 
          message: 'User already exists' 
        } 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: { 
        code: '500', 
        message: 'A server error has occurred during registration' 
      } 
    });
  }
}

// Login function
async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: { 
          code: '400', 
          message: 'Email and password are required' 
        } 
      });
    }

    // Check if we're in fallback mode
    if (isFallbackMode()) {
      console.log('🔄 Running in fallback mode (missing environment variables)');
      
      // Find user in memory
      const user = findFallbackUser(email);
      if (!user) {
        return res.status(400).json({ 
          error: { 
            code: '400', 
            message: 'Invalid credentials' 
          } 
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          error: { 
            code: '400', 
            message: 'Invalid credentials' 
          } 
        });
      }

      // Update last login in memory
      user.lastLogin = new Date();

      // Generate fallback token
      const token = generateFallbackToken(user);

      return res.json({
        message: 'Login successful (fallback mode)',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        warning: 'Running in fallback mode. Please configure MONGODB_URI and JWT_SECRET for production.'
      });
    }

    // Normal database mode
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        error: { 
          code: '400', 
          message: 'Invalid credentials' 
        } 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        error: { 
          code: '400', 
          message: 'Invalid credentials' 
        } 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: { 
        code: '500', 
        message: 'Server error during login' 
      } 
    });
  }
}

// Main handler for Vercel
module.exports = async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Connect to database only if not in fallback mode
  if (!isFallbackMode()) {
    try {
      await connectDB();
    } catch (error) {
      console.error('Database connection error:', error);
      return res.status(500).json({ 
        error: { 
          code: '500', 
          message: 'Database connection failed. Please add MONGODB_URI to Vercel environment variables.' 
        } 
      });
    }
  } else {
    console.log('⚠️  Running in fallback mode - skipping database connection');
  }

  // Route based on URL path and method
  const { url, method } = req;
  
  // Extract the action from query parameter or URL
  const urlObj = new URL(url, `http://${req.headers.host}`);
  const action = urlObj.searchParams.get('action') || urlObj.pathname.split('/').pop();
  
  if ((action === 'register' || url.includes('/register')) && method === 'POST') {
    return handleRegister(req, res);
  } else if ((action === 'login' || url.includes('/login')) && method === 'POST') {
    return handleLogin(req, res);
  } else if (method === 'POST' && !action) {
    // Default to login if no action specified
    return handleLogin(req, res);
  } else {
    return res.status(405).json({ 
      message: 'Method not allowed',
      allowedMethods: ['POST'],
      availableActions: ['login', 'register']
    });
  }
}