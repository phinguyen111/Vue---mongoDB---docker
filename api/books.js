const Book = require('../server/models/BookModel');
const connectDB = require('../server/config/database');
const auth = require('../server/middleware/auth');

// CORS helper function
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
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
    } = req.query;

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

// Main handler for Vercel
export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Connect to database
  await connectDB();

  const { url, method } = req;
  const bookIdMatch = url.match(/\/api\/books\/([^/]+)$/);
  
  if (url === '/api/books' && method === 'GET') {
    return getAllBooks(req, res);
  } else if (url === '/api/books' && method === 'POST') {
    // Apply auth middleware for admin operations
    return auth(req, res, () => createBook(req, res));
  } else if (bookIdMatch && method === 'GET') {
    req.params = { id: bookIdMatch[1] };
    return getBookById(req, res);
  } else if (bookIdMatch && method === 'PUT') {
    req.params = { id: bookIdMatch[1] };
    return auth(req, res, () => updateBook(req, res));
  } else if (bookIdMatch && method === 'DELETE') {
    req.params = { id: bookIdMatch[1] };
    return auth(req, res, () => deleteBook(req, res));
  } else {
    return res.status(404).json({ message: 'Not found' });
  }
}