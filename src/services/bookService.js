import ApiService from './api.js';
import { mockBooks, categories } from '../data/mockData.js';

class BookService {
  constructor() {
    this.useApi = true; // Use API by default, fallback to mock data on error
    this.apiService = ApiService;
  }

  // Enable/disable API usage
  setApiMode(enabled) {
    this.useApi = enabled;
  }

  // Get all books with optional filters
  async getBooks(filters = {}) {
    if (this.useApi) {
      try {
        const queryParams = new URLSearchParams();
        
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.year) queryParams.append('year', filters.year);
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.limit) queryParams.append('limit', filters.limit);
        
        const endpoint = `/books${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await this.apiService.get(endpoint);
        
        return {
          books: response.data || response.books || [],
          total: response.total || response.books?.length || 0,
          page: response.page || 1,
          totalPages: response.totalPages || 1
        };
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return this.getMockBooks(filters);
      }
    } else {
      return this.getMockBooks(filters);
    }
  }

  // Get mock books with filters (fallback)
  getMockBooks(filters = {}) {
    let filteredBooks = [...mockBooks];
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      filteredBooks = filteredBooks.filter(book => book.category === filters.category);
    }
    
    // Apply year filter
    if (filters.year && filters.year !== 'all') {
      filteredBooks = filteredBooks.filter(book => book.year.toString() === filters.year.toString());
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'title':
          filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'author':
          filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
          break;
        case 'year':
          filteredBooks.sort((a, b) => b.year - a.year);
          break;
        case 'rating':
          filteredBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          filteredBooks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          break;
      }
    }
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
    
    return {
      books: paginatedBooks,
      total: filteredBooks.length,
      page: page,
      totalPages: Math.ceil(filteredBooks.length / limit)
    };
  }

  // Get single book by ID
  async getBookById(id) {
    if (this.useApi) {
      try {
        const response = await this.apiService.get(`/books/${id}`);
        return response.data || response;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return mockBooks.find(book => book.id === parseInt(id));
      }
    } else {
      return mockBooks.find(book => book.id === parseInt(id));
    }
  }

  // Get featured books
  async getFeaturedBooks(limit = 6) {
    if (this.useApi) {
      try {
        const response = await this.apiService.get(`/books/featured?limit=${limit}`);
        return response.data || response.books || [];
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return mockBooks.filter(book => book.featured).slice(0, limit);
      }
    } else {
      return mockBooks.filter(book => book.featured).slice(0, limit);
    }
  }

  // Get categories
  async getCategories() {
    if (this.useApi) {
      try {
        const response = await this.apiService.get('/books/categories');
        return response.data || response.categories || categories;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return categories;
      }
    } else {
      return categories;
    }
  }

  // Search suggestions
  async getSearchSuggestions(query, limit = 5) {
    if (!query || query.length < 2) return [];
    
    const suggestions = [];
    const searchTerm = query.toLowerCase();
    
    // Get book titles
    const books = this.useApi ? 
      (await this.getBooks({ search: query, limit: limit * 2 })).books :
      mockBooks;
    
    books.forEach(book => {
      if (book.title.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          text: book.title,
          type: 'title',
          icon: 'fas fa-book'
        });
      }
      if (book.author.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          text: book.author,
          type: 'author',
          icon: 'fas fa-user'
        });
      }
    });
    
    // Get categories
    const allCategories = await this.getCategories();
    allCategories.forEach(category => {
      if (category.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          text: category,
          type: 'category',
          icon: 'fas fa-tag'
        });
      }
    });
    
    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text && s.type === suggestion.type)
      )
      .slice(0, limit);
    
    return uniqueSuggestions;
  }

  // Admin functions
  async createBook(bookData) {
    if (this.useApi) {
      try {
        const response = await this.apiService.post('/books', bookData);
        return response.data || response;
      } catch (error) {
        console.error('Failed to create book:', error);
        throw error;
      }
    } else {
      // Mock creation for development
      const newBook = {
        id: Math.max(...mockBooks.map(b => b.id)) + 1,
        ...bookData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockBooks.push(newBook);
      return newBook;
    }
  }

  async updateBook(id, bookData) {
    if (this.useApi) {
      try {
        const response = await this.apiService.put(`/books/${id}`, bookData);
        return response.data || response;
      } catch (error) {
        console.error('Failed to update book:', error);
        throw error;
      }
    } else {
      // Mock update for development
      const bookIndex = mockBooks.findIndex(book => book.id === parseInt(id));
      if (bookIndex !== -1) {
        mockBooks[bookIndex] = {
          ...mockBooks[bookIndex],
          ...bookData,
          updatedAt: new Date().toISOString()
        };
        return mockBooks[bookIndex];
      }
      throw new Error('Book not found');
    }
  }

  async deleteBook(id) {
    if (this.useApi) {
      try {
        await this.apiService.delete(`/books/${id}`);
        return true;
      } catch (error) {
        console.error('Failed to delete book:', error);
        throw error;
      }
    } else {
      // Mock deletion for development
      const bookIndex = mockBooks.findIndex(book => book.id === parseInt(id));
      if (bookIndex !== -1) {
        mockBooks.splice(bookIndex, 1);
        return true;
      }
      throw new Error('Book not found');
    }
  }

  // Get book statistics for admin dashboard
  async getBookStats() {
    if (this.useApi) {
      try {
        const response = await this.apiService.get('/books/stats');
        return response.data || response;
      } catch (error) {
        console.warn('API call failed, calculating from mock data:', error);
        return this.getMockStats();
      }
    } else {
      return this.getMockStats();
    }
  }

  getMockStats() {
    const totalBooks = mockBooks.length;
    const categoryCounts = {};
    const yearCounts = {};
    
    mockBooks.forEach(book => {
      // Count by category
      categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
      
      // Count by year
      yearCounts[book.year] = (yearCounts[book.year] || 0) + 1;
    });
    
    return {
      totalBooks,
      totalCategories: Object.keys(categoryCounts).length,
      featuredBooks: mockBooks.filter(book => book.featured).length,
      averageRating: mockBooks.reduce((sum, book) => sum + (book.rating || 0), 0) / totalBooks,
      categoryCounts,
      yearCounts,
      recentBooks: mockBooks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };
  }
}

export default new BookService();