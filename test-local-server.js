const express = require('express');
const cors = require('cors');
const authHandler = require('./api/auth.js');
const testHandler = require('./api/test.js');
const booksHandler = require('./api/books.js');
const usersHandler = require('./api/users.js');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock req/res for Vercel handlers
function createMockReq(method, url, body = {}, headers = {}) {
  return {
    method,
    url,
    headers: { host: `localhost:${PORT}`, ...headers },
    body
  };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.body = data;
      return this;
    },
    setHeader: function(name, value) {
      this.headers[name] = value;
      return this;
    },
    end: function() {
      return this;
    }
  };
  return res;
}

// Routes
app.all('/api/auth*', async (req, res) => {
  console.log(`📝 Auth request: ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  
  const mockReq = createMockReq(req.method, req.url, req.body, req.headers);
  const mockRes = createMockRes();
  
  try {
    await authHandler(mockReq, mockRes);
    res.status(mockRes.statusCode).json(mockRes.body);
  } catch (error) {
    console.error('Auth handler error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.all('/api/test*', async (req, res) => {
  console.log(`🧪 Test request: ${req.method} ${req.url}`);
  
  const mockReq = createMockReq(req.method, req.url, req.body, req.headers);
  const mockRes = createMockRes();
  
  try {
    await testHandler(mockReq, mockRes);
    res.status(mockRes.statusCode).json(mockRes.body);
  } catch (error) {
    console.error('Test handler error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.all('/api/books*', async (req, res) => {
  console.log(`📚 Books request: ${req.method} ${req.url}`);
  
  const mockReq = createMockReq(req.method, req.url, req.body, req.headers);
  const mockRes = createMockRes();
  
  try {
    await booksHandler(mockReq, mockRes);
    res.status(mockRes.statusCode).json(mockRes.body);
  } catch (error) {
    console.error('Books handler error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Users API handler
app.all('/api/users*', async (req, res) => {
  console.log(`👥 Users request: ${req.method} ${req.url}`);
  
  const mockReq = createMockReq(req.method, req.url, req.body, req.headers);
  const mockRes = createMockRes();
  
  try {
    await usersHandler(mockReq, mockRes);
    res.status(mockRes.statusCode).json(mockRes.body);
  } catch (error) {
    console.error('Users handler error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Local test server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('  - GET  /health');
  console.log('  - GET  /api/test');
  console.log('  - GET  /api/books');
  console.log('  - GET  /api/users');
  console.log('  - POST /api/auth?action=register');
  console.log('  - POST /api/auth?action=login');
  console.log('');
  console.log('🧪 Test the auth API with:');
  console.log('  curl -X POST http://localhost:3001/api/auth?action=register \\');
  console.log('    -H "Content-Type: application/json" \\');
  console.log('    -d "{\"name\":\"Test User\",\"email\":\"test@test.com\",\"password\":\"123456\"}"');
});