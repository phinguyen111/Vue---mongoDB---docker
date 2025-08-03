const express = require('express');
const Book = require('../models/BookModel');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all books with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      year,
      minRating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
      featured
    } = req.query;

    let query = { isActive: true };
    let sort = {};

    // Build search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Year filter
    if (year && year !== 'all') {
      query.year = parseInt(year);
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Build sort object
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    sort[sortBy] = sortDirection;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [books, totalBooks] = await Promise.all([
      Book.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('reviews.user', 'name'),
      Book.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalBooks / limitNum);

    res.json({
      success: true,
      books,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBooks,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách sách'
    });
  }
});

// Get featured books
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const books = await Book.getFeatured(limit);

    res.json({
      success: true,
      books
    });

  } catch (error) {
    console.error('Get featured books error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy sách nổi bật'
    });
  }
});

// Get book statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Book.getStats();

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get book stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê sách'
    });
  }
});

// Get book categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Book.distinct('category', { isActive: true });

    res.json({
      success: true,
      categories: categories.sort()
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh mục'
    });
  }
});

// Search suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const suggestions = await Book.find(
      {
        isActive: true,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { author: { $regex: q, $options: 'i' } }
        ]
      },
      'title author'
    ).limit(5);

    const formattedSuggestions = suggestions.map(book => ({
      title: book.title,
      author: book.author,
      type: 'book'
    }));

    res.json({
      success: true,
      suggestions: formattedSuggestions
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tìm kiếm gợi ý'
    });
  }
});

// Get single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('reviews.user', 'name avatar');

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }

    // Increment view count
    await book.incrementViewCount();

    res.json({
      success: true,
      book
    });

  } catch (error) {
    console.error('Get book by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID sách không hợp lệ'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin sách'
    });
  }
});

// Create new book (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bookData = req.body;

    // Create new book
    const book = new Book(bookData);
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Tạo sách thành công',
      book
    });

  } catch (error) {
    console.error('Create book error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Dữ liệu không hợp lệ'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'ISBN đã tồn tại'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo sách'
    });
  }
});

// Update book (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật sách thành công',
      book
    });

  } catch (error) {
    console.error('Update book error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Dữ liệu không hợp lệ'
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID sách không hợp lệ'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'ISBN đã tồn tại'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật sách'
    });
  }
});

// Delete book (Admin only) - Soft delete
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }

    res.json({
      success: true,
      message: 'Xóa sách thành công'
    });

  } catch (error) {
    console.error('Delete book error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID sách không hợp lệ'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa sách'
    });
  }
});

// Add review to book (Authenticated users)
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.id;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá phải từ 1 đến 5 sao'
      });
    }

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }

    await book.addReview(userId, rating, comment);

    // Populate the updated book with reviews
    const updatedBook = await Book.findById(bookId)
      .populate('reviews.user', 'name avatar');

    res.json({
      success: true,
      message: 'Thêm đánh giá thành công',
      book: updatedBook
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm đánh giá'
    });
  }
});

// Add/Remove book from favorites (Authenticated users)
router.post('/:id/favorite', authMiddleware, async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;

    const [book, user] = await Promise.all([
      Book.findById(bookId),
      User.findById(userId)
    ]);

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }

    const isFavorite = user.favorites.includes(bookId);
    
    if (isFavorite) {
      await user.removeFromFavorites(bookId);
      res.json({
        success: true,
        message: 'Đã bỏ khỏi danh sách yêu thích',
        isFavorite: false
      });
    } else {
      await user.addToFavorites(bookId);
      res.json({
        success: true,
        message: 'Đã thêm vào danh sách yêu thích',
        isFavorite: true
      });
    }

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật yêu thích'
    });
  }
});

// Add book to reading history (Authenticated users)
router.post('/:id/history', authMiddleware, async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;

    const [book, user] = await Promise.all([
      Book.findById(bookId),
      User.findById(userId)
    ]);

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }

    await user.addToHistory(bookId);

    res.json({
      success: true,
      message: 'Đã thêm vào lịch sử đọc'
    });

  } catch (error) {
    console.error('Add to history error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm vào lịch sử'
    });
  }
});

module.exports = router;