import ApiService from './api.js';
import BookService from './bookService.js';
import { mockBooks } from '../data/mockData.js';

class AdminService {
  constructor() {
    this.useApi = false; // Toggle between API and mock data
    this.apiService = ApiService;
  }

  // Enable/disable API usage
  setApiMode(enabled) {
    this.useApi = enabled;
    BookService.setApiMode(enabled);
  }

  // Dashboard Statistics
  async getDashboardStats() {
    if (this.useApi) {
      try {
        const response = await this.apiService.get('/admin/dashboard/stats');
        return response.data || response;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return this.getMockDashboardStats();
      }
    } else {
      return this.getMockDashboardStats();
    }
  }

  getMockDashboardStats() {
    const totalBooks = mockBooks.length;
    const categoryCounts = {};
    const yearCounts = {};
    const authorCounts = {};
    
    mockBooks.forEach(book => {
      // Count by category
      categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
      
      // Count by year
      yearCounts[book.year] = (yearCounts[book.year] || 0) + 1;
      
      // Count by author
      authorCounts[book.author] = (authorCounts[book.author] || 0) + 1;
    });
    
    const currentDate = new Date();
    const thisMonth = currentDate.getMonth();
    const thisYear = currentDate.getFullYear();
    
    // Mock recent activity
    const recentBooks = mockBooks
      .filter(book => {
        const bookDate = new Date(book.createdAt);
        return bookDate.getMonth() === thisMonth && bookDate.getFullYear() === thisYear;
      })
      .length;
    
    return {
      totalBooks,
      totalCategories: Object.keys(categoryCounts).length,
      totalAuthors: Object.keys(authorCounts).length,
      featuredBooks: mockBooks.filter(book => book.featured).length,
      averageRating: mockBooks.reduce((sum, book) => sum + (book.rating || 0), 0) / totalBooks,
      booksThisMonth: recentBooks,
      categoryCounts,
      yearCounts,
      authorCounts,
      topCategories: Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count })),
      topAuthors: Object.entries(authorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([author, count]) => ({ author, count })),
      recentBooks: mockBooks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
    };
  }

  // Book Management
  async createBook(bookData) {
    try {
      // Validate required fields
      const requiredFields = ['title', 'author', 'category', 'year'];
      for (const field of requiredFields) {
        if (!bookData[field]) {
          throw new Error(`Trường ${field} là bắt buộc`);
        }
      }
      
      // Add metadata
      const enrichedBookData = {
        ...bookData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: bookData.featured || false,
        rating: bookData.rating || 0,
        description: bookData.description || '',
        cover: '/default-book-cover.svg'
      };
      
      const result = await BookService.createBook(enrichedBookData);
      return {
        success: true,
        data: result,
        message: 'Sách đã được tạo thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Có lỗi xảy ra khi tạo sách'
      };
    }
  }

  async updateBook(id, bookData) {
    try {
      const enrichedBookData = {
        ...bookData,
        updatedAt: new Date().toISOString()
      };
      
      const result = await BookService.updateBook(id, enrichedBookData);
      return {
        success: true,
        data: result,
        message: 'Sách đã được cập nhật thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Có lỗi xảy ra khi cập nhật sách'
      };
    }
  }

  async deleteBook(id) {
    try {
      await BookService.deleteBook(id);
      return {
        success: true,
        message: 'Sách đã được xóa thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Có lỗi xảy ra khi xóa sách'
      };
    }
  }

  async bulkDeleteBooks(bookIds) {
    try {
      const results = await Promise.allSettled(
        bookIds.map(id => BookService.deleteBook(id))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return {
        success: failed === 0,
        message: `Đã xóa ${successful} sách thành công${failed > 0 ? `, ${failed} sách thất bại` : ''}`,
        details: { successful, failed }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Có lỗi xảy ra khi xóa sách hàng loạt'
      };
    }
  }

  // Category Management
  async getCategories() {
    return await BookService.getCategories();
  }

  async createCategory(categoryData) {
    if (this.useApi) {
      try {
        const response = await this.apiService.post('/admin/categories', categoryData);
        return {
          success: true,
          data: response.data || response,
          message: 'Danh mục đã được tạo thành công'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: 'Có lỗi xảy ra khi tạo danh mục'
        };
      }
    } else {
      // Mock category creation
      return {
        success: true,
        data: { id: Date.now(), ...categoryData },
        message: 'Danh mục đã được tạo thành công (Mock)'
      };
    }
  }

  // User Management (for future implementation)
  async getUsers(filters = {}) {
    if (this.useApi) {
      try {
        const queryParams = new URLSearchParams(filters);
        const response = await this.apiService.get(`/admin/users?${queryParams}`);
        return response.data || response;
      } catch (error) {
        console.warn('API call failed:', error);
        return { users: [], total: 0 };
      }
    } else {
      // Mock users data
      return {
        users: [
          {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          }
        ],
        total: 1
      };
    }
  }

  // System Settings
  async getSystemSettings() {
    if (this.useApi) {
      try {
        const response = await this.apiService.get('/admin/settings');
        return response.data || response;
      } catch (error) {
        console.warn('API call failed:', error);
        return this.getDefaultSettings();
      }
    } else {
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      siteName: 'Thư viện Sách',
      siteDescription: 'Hệ thống quản lý thư viện sách trực tuyến',
      booksPerPage: 12,
      enableRegistration: true,
      enableComments: true,
      enableRatings: true,
      maintenanceMode: false,
      featuredBooksLimit: 6,
      searchSuggestionsLimit: 5
    };
  }

  async updateSystemSettings(settings) {
    if (this.useApi) {
      try {
        const response = await this.apiService.put('/admin/settings', settings);
        return {
          success: true,
          data: response.data || response,
          message: 'Cài đặt đã được cập nhật thành công'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: 'Có lỗi xảy ra khi cập nhật cài đặt'
        };
      }
    } else {
      // Mock settings update
      return {
        success: true,
        data: settings,
        message: 'Cài đặt đã được cập nhật thành công (Mock)'
      };
    }
  }

  // Analytics and Reports
  async getAnalytics(period = '30d') {
    if (this.useApi) {
      try {
        const response = await this.apiService.get(`/admin/analytics?period=${period}`);
        return response.data || response;
      } catch (error) {
        console.warn('API call failed:', error);
        return this.getMockAnalytics(period);
      }
    } else {
      return this.getMockAnalytics(period);
    }
  }

  getMockAnalytics(period) {
    // Generate mock analytics data
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 100) + 50,
        searches: Math.floor(Math.random() * 50) + 20,
        newBooks: Math.floor(Math.random() * 5),
        activeUsers: Math.floor(Math.random() * 30) + 10
      });
    }
    
    return {
      period,
      data,
      summary: {
        totalViews: data.reduce((sum, d) => sum + d.views, 0),
        totalSearches: data.reduce((sum, d) => sum + d.searches, 0),
        totalNewBooks: data.reduce((sum, d) => sum + d.newBooks, 0),
        averageActiveUsers: Math.round(data.reduce((sum, d) => sum + d.activeUsers, 0) / data.length)
      }
    };
  }

  // Backup and Export
  async exportBooks(format = 'json') {
    try {
      const books = await BookService.getBooks({ limit: 10000 }); // Get all books
      
      if (format === 'json') {
        return {
          success: true,
          data: JSON.stringify(books.books, null, 2),
          filename: `books_export_${new Date().toISOString().split('T')[0]}.json`,
          contentType: 'application/json'
        };
      } else if (format === 'csv') {
        const csvHeaders = ['ID', 'Title', 'Author', 'Category', 'Year', 'Rating', 'Description'];
        const csvRows = books.books.map(book => [
          book.id,
          `"${book.title}"`,
          `"${book.author}"`,
          book.category,
          book.year,
          book.rating || 0,
          `"${(book.description || '').replace(/"/g, '""')}"`
        ]);
        
        const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
        
        return {
          success: true,
          data: csvContent,
          filename: `books_export_${new Date().toISOString().split('T')[0]}.csv`,
          contentType: 'text/csv'
        };
      }
      
      throw new Error('Định dạng không được hỗ trợ');
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Có lỗi xảy ra khi xuất dữ liệu'
      };
    }
  }
}

export default new AdminService();