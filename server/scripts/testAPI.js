const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'test123'
};

const adminCredentials = {
  email: 'admin@example.com',
  password: 'admin123'
};

const userCredentials = {
  email: 'john@example.com',
  password: 'user123'
};

let authToken = '';
let adminToken = '';
let testBookId = '';

// Helper function to make API requests
const apiRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('\n🏥 Testing Health Check...');
  const result = await apiRequest('GET', '/health');
  
  if (result.success) {
    console.log('✅ Health check passed');
    console.log('   Response:', result.data);
  } else {
    console.log('❌ Health check failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

const testUserRegistration = async () => {
  console.log('\n👤 Testing User Registration...');
  const result = await apiRequest('POST', '/auth/register', testUser);
  
  if (result.success) {
    console.log('✅ User registration successful');
    console.log('   User:', result.data.user?.name);
  } else {
    console.log('❌ User registration failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

const testUserLogin = async () => {
  console.log('\n🔐 Testing User Login...');
  const result = await apiRequest('POST', '/auth/login', userCredentials);
  
  if (result.success) {
    authToken = result.data.token;
    console.log('✅ User login successful');
    console.log('   User:', result.data.user?.name);
    console.log('   Token received:', authToken ? 'Yes' : 'No');
  } else {
    console.log('❌ User login failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

const testAdminLogin = async () => {
  console.log('\n👑 Testing Admin Login...');
  const result = await apiRequest('POST', '/auth/login', adminCredentials);
  
  if (result.success) {
    adminToken = result.data.token;
    console.log('✅ Admin login successful');
    console.log('   Admin:', result.data.user?.name);
    console.log('   Token received:', adminToken ? 'Yes' : 'No');
  } else {
    console.log('❌ Admin login failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

const testGetBooks = async () => {
  console.log('\n📚 Testing Get Books...');
  const result = await apiRequest('GET', '/books');
  
  if (result.success) {
    console.log('✅ Get books successful');
    console.log('   Total books:', result.data.books?.length || 0);
    console.log('   Pagination:', result.data.pagination);
    
    if (result.data.books?.length > 0) {
      testBookId = result.data.books[0]._id;
      console.log('   First book:', result.data.books[0].title);
    }
  } else {
    console.log('❌ Get books failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

const testGetBookById = async () => {
  if (!testBookId) {
    console.log('\n⚠️  Skipping Get Book by ID (no book ID available)');
    return false;
  }
  
  console.log('\n📖 Testing Get Book by ID...');
  const result = await apiRequest('GET', `/books/${testBookId}`);
  
  if (result.success) {
    console.log('✅ Get book by ID successful');
    console.log('   Book:', result.data.book?.title);
    console.log('   Author:', result.data.book?.author);
    console.log('   View count:', result.data.book?.viewCount);
  } else {
    console.log('❌ Get book by ID failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

const testSearchBooks = async () => {
  console.log('\n🔍 Testing Search Books...');
  const result = await apiRequest('GET', '/books?search=Đắc');
  
  if (result.success) {
    console.log('✅ Search books successful');
    console.log('   Found books:', result.data.books?.length || 0);
    if (result.data.books?.length > 0) {
      console.log('   First result:', result.data.books[0].title);
    }
  } else {
    console.log('❌ Search books failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

const testGetCategories = async () => {
  console.log('\n📂 Testing Get Categories...');
  const result = await apiRequest('GET', '/books/categories');
  
  if (result.success) {
    console.log('✅ Get categories successful');
    console.log('   Categories:', result.data.categories);
  } else {
    console.log('❌ Get categories failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

const testGetFeaturedBooks = async () => {
  console.log('\n⭐ Testing Get Featured Books...');
  const result = await apiRequest('GET', '/books/featured');
  
  if (result.success) {
    console.log('✅ Get featured books successful');
    console.log('   Featured books:', result.data.books?.length || 0);
  } else {
    console.log('❌ Get featured books failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

const testAddToFavorites = async () => {
  if (!testBookId || !authToken) {
    console.log('\n⚠️  Skipping Add to Favorites (missing book ID or auth token)');
    return false;
  }
  
  console.log('\n❤️  Testing Add to Favorites...');
  const result = await apiRequest('POST', `/books/${testBookId}/favorite`, {}, authToken);
  
  if (result.success) {
    console.log('✅ Add to favorites successful');
    console.log('   Message:', result.data.message);
    console.log('   Is favorite:', result.data.isFavorite);
  } else {
    console.log('❌ Add to favorites failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

const testAddReview = async () => {
  if (!testBookId || !authToken) {
    console.log('\n⚠️  Skipping Add Review (missing book ID or auth token)');
    return false;
  }
  
  console.log('\n⭐ Testing Add Review...');
  const reviewData = {
    rating: 5,
    comment: 'Cuốn sách rất hay và bổ ích!'
  };
  
  const result = await apiRequest('POST', `/books/${testBookId}/reviews`, reviewData, authToken);
  
  if (result.success) {
    console.log('✅ Add review successful');
    console.log('   Message:', result.data.message);
    console.log('   Reviews count:', result.data.book?.reviews?.length || 0);
  } else {
    console.log('❌ Add review failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

const testCreateBook = async () => {
  if (!adminToken) {
    console.log('\n⚠️  Skipping Create Book (no admin token)');
    return false;
  }
  
  console.log('\n📝 Testing Create Book (Admin)...');
  const newBook = {
    title: 'Test Book',
    author: 'Test Author',
    category: 'Test Category',
    year: 2024,
    description: 'This is a test book created by API test.',
    isbn: '978-0-000000-00-0',
    publisher: 'Test Publisher',
    pages: 100,
    language: 'Tiếng Việt'
  };
  
  const result = await apiRequest('POST', '/books', newBook, adminToken);
  
  if (result.success) {
    console.log('✅ Create book successful');
    console.log('   Book:', result.data.book?.title);
    console.log('   ID:', result.data.book?._id);
  } else {
    console.log('❌ Create book failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

const testGetProfile = async () => {
  if (!authToken) {
    console.log('\n⚠️  Skipping Get Profile (no auth token)');
    return false;
  }
  
  console.log('\n👤 Testing Get Profile...');
  const result = await apiRequest('GET', '/auth/profile', null, authToken);
  
  if (result.success) {
    console.log('✅ Get profile successful');
    console.log('   Name:', result.data.user?.name);
    console.log('   Email:', result.data.user?.email);
    console.log('   Role:', result.data.user?.role);
    console.log('   Favorites:', result.data.user?.favorites?.length || 0);
    console.log('   History:', result.data.user?.history?.length || 0);
  } else {
    console.log('❌ Get profile failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
};

// Main test function
const runTests = async () => {
  console.log('🚀 Bắt đầu test API endpoints...');
  console.log('📍 API Base URL:', API_BASE_URL);
  
  const results = [];
  
  // Run all tests
  results.push(await testHealthCheck());
  results.push(await testUserRegistration());
  results.push(await testUserLogin());
  results.push(await testAdminLogin());
  results.push(await testGetBooks());
  results.push(await testGetBookById());
  results.push(await testSearchBooks());
  results.push(await testGetCategories());
  results.push(await testGetFeaturedBooks());
  results.push(await testAddToFavorites());
  results.push(await testAddReview());
  results.push(await testCreateBook());
  results.push(await testGetProfile());
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Passed: ${passed}/${total}`);
  console.log(`   ❌ Failed: ${total - passed}/${total}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 Tất cả tests đều PASS! API hoạt động tốt.');
  } else {
    console.log('\n⚠️  Một số tests FAILED. Kiểm tra lại server và database.');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  apiRequest
};