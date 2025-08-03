const express = require('express');
const { books } = require('../models/Book');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all books
router.get('/', (req, res) => {
  try {
    const { search, category, year, sortBy, page = 1, limit = 10 } = req.query;
    
    let filteredBooks = [...books];
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBooks = filteredBooks.filter(book =>
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower)
      );
    }
    
    // Category filter
    if (category) {
      filteredBooks = filteredBooks.filter(book => book.category === category);
    }
    
    // Year filter
    if (year) {
      filteredBooks = filteredBooks.filter(book => book.year == year);
    }
    
    // Sorting
    if (sortBy) {
      filteredBooks.sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'author':
            return a.author.localeCompare(b.author);
          case 'year':
            return b.year - a.year;
          default:
            return 0;
        }
      });
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
    
    res.json({
      books: paginatedBooks,
      total: filteredBooks.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredBooks.length / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get book by ID
router.get('/:id', (req, res) => {
  try {
    const book = books.find(b => b.id == req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Create new book (Admin only)
router.post('/', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { title, author, category, year, description, cover } = req.body;
    
    if (!title || !author || !category || !year) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    const newBook = {
      id: Math.max(...books.map(b => b.id)) + 1,
      title,
      author,
      category,
      year: parseInt(year),
      description: description || '',
      cover: '/default-book-cover.svg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    books.push(newBook);
    
    res.status(201).json({
      book: newBook,
      message: 'Book created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// Update book (Admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const bookIndex = books.findIndex(b => b.id == req.params.id);
    
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const updatedBook = {
      ...books[bookIndex],
      ...req.body,
      id: books[bookIndex].id, // Prevent ID change
      updatedAt: new Date().toISOString()
    };
    
    books[bookIndex] = updatedBook;
    
    res.json({
      book: updatedBook,
      message: 'Book updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Delete book (Admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const bookIndex = books.findIndex(b => b.id == req.params.id);
    
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    books.splice(bookIndex, 1);
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;