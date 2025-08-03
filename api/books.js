// Load environment variables
require('dotenv').config();

const Book = require('../server/models/BookModel');
const connectDB = require('../server/config/database');
const { authMiddleware } = require('../server/middleware/auth');

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

// Get all books with search, filter, and pagination
async function getAllBooks(req, res) {
  try {
    const {
      search,
      category,
      year,
      featured,
      sortBy = 'title',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query || {};

    // Build query
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (year) {
      query.year = parseInt(year);
    }

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const books = await Book.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('reviews.user', 'name');

    // Get total count for pagination
    const total = await Book.countDocuments(query);

    res.json({
      books,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get book by ID
async function getBookById(req, res) {
  try {
    const book = await Book.findById(req.params.id)
      .populate('reviews.user', 'name');
    
    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Increment view count
    book.viewCount = (book.viewCount || 0) + 1;
    await book.save();

    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Add new book (admin only)
async function createBook(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Update book (admin only)
async function updateBook(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Delete book (admin only)
async function deleteBook(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get categories
async function getCategories(req, res) {
  try {
    const categories = await Book.distinct('category');
    
    if (!categories || categories.length === 0) {
      return res.json({
        success: true,
        categories: []
      });
    }
    
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Book.countDocuments({ category, isActive: true });
        return { name: category, count };
      })
    );
    
    res.json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'Server error' });
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

  // Connect to database
  await connectDB();

  const { url, method } = req;
  
  // Parse URL to handle both /api/books and direct /books patterns
  const urlPath = url.replace(/^.*\/api/, '') || url;
  
  // Check for specific endpoints first before generic patterns
  const isCategoriesEndpoint = urlPath === '/books/categories' || url.includes('/books/categories');
  const isRootBooks = urlPath === '/books' || (url.includes('/api/books') && !url.includes('/books/'));
  const bookIdMatch = !isCategoriesEndpoint && (urlPath.match(/^\/books\/([^\/?]+)/) || url.match(/\/books\/([^\/?]+)/));
  
  if (isCategoriesEndpoint && method === 'GET') {
    return getCategories(req, res);
  } else if (isRootBooks && method === 'GET') {
    return getAllBooks(req, res);
  } else if (isRootBooks && method === 'POST') {
    // Apply auth middleware for admin operations
    return authMiddleware(req, res, () => createBook(req, res));
  } else if (bookIdMatch && method === 'GET') {
    req.params = { id: bookIdMatch[1] };
    return getBookById(req, res);
  } else if (bookIdMatch && method === 'PUT') {
    req.params = { id: bookIdMatch[1] };
    return authMiddleware(req, res, () => updateBook(req, res));
  } else if (bookIdMatch && method === 'DELETE') {
    req.params = { id: bookIdMatch[1] };
    return authMiddleware(req, res, () => deleteBook(req, res));
  } else if (isRootBooks || bookIdMatch) {
    // Valid endpoint but wrong method
    const allowedMethods = isRootBooks ? ['GET', 'POST'] : ['GET', 'PUT', 'DELETE'];
    return res.status(405).json({ 
      message: 'Method not allowed',
      allowedMethods,
      endpoint: isRootBooks ? '/api/books' : `/api/books/${bookIdMatch[1]}`
    });
  } else {
    return res.status(404).json({ message: 'Endpoint not found' });
  }
}