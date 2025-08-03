const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../server/models/User');
const connectDB = require('../server/config/database');

// Mock storage for development/testing when env vars are missing
let mockUsers = [
  {
    _id: 'mock-user-1',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8G', // 'password123'
    role: 'user',
    createdAt: new Date(),
    lastLogin: null
  }
];

// Mock JWT secret for development
const MOCK_JWT_SECRET = 'mock-jwt-secret-for-development-only';

// Check if we're in mock mode (missing environment variables)
function isMockMode() {
  return !process.env.MONGODB_URI || !process.env.JWT_SECRET;
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

    if (isMockMode()) {
      // Mock mode - use in-memory storage
      console.log('🔧 Running in MOCK MODE - using in-memory storage');
      
      // Check if user already exists in mock storage
      const existingUser = mockUsers.find(u => u.email === email);
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

      // Create new mock user
      const newUser = {
        _id: `mock-user-${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        role: 'user',
        createdAt: new Date(),
        lastLogin: null
      };

      // Add to mock storage
      mockUsers.push(newUser);

      // Generate JWT token with mock secret
      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email, role: newUser.role },
        MOCK_JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        message: 'User created successfully (MOCK MODE)',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        warning: 'This is running in mock mode. Please configure MONGODB_URI and JWT_SECRET for production.'
      });
    }

    // Production mode - use MongoDB
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

    if (isMockMode()) {
      // Mock mode - use in-memory storage
      console.log('🔧 Running in MOCK MODE - using in-memory storage');
      
      // Find user in mock storage
      const user = mockUsers.find(u => u.email === email);
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

      // Update last login in mock storage
      user.lastLogin = new Date();

      // Generate JWT token with mock secret
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        MOCK_JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Login successful (MOCK MODE)',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        warning: 'This is running in mock mode. Please configure MONGODB_URI and JWT_SECRET for production.'
      });
    }

    // Production mode - use MongoDB
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

  // Connect to database only if not in mock mode
  if (!isMockMode()) {
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
    console.log('🔧 Skipping database connection - running in MOCK MODE');
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