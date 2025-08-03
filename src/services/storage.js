/**
 * Storage Service - Quản lý localStorage cho ứng dụng
 */

class StorageService {
  // Keys for localStorage
  static KEYS = {
    BOOKS: 'books',
    LANGUAGE: 'language',
    USERS: 'library_users',
    USER_DATA: 'library_user_data'
  };

  /**
   * Language methods
   */
  static getLanguage() {
    return localStorage.getItem(this.KEYS.LANGUAGE) || "vi";
  }

  static setLanguage(lang) {
    localStorage.setItem(this.KEYS.LANGUAGE, lang);
  }

  /**
   * Books methods
   */
  static getBooks() {
    try {
      const books = localStorage.getItem(this.KEYS.BOOKS);
      return books ? JSON.parse(books) : [];
    } catch (error) {
      console.error('Error getting books from storage:', error);
      return [];
    }
  }

  static saveBooks(books) {
    try {
      localStorage.setItem(this.KEYS.BOOKS, JSON.stringify(books));
    } catch (error) {
      console.error('Error saving books to storage:', error);
      throw new Error('Không thể lưu dữ liệu sách');
    }
  }

  /**
   * Thêm sách mới
   * @param {Object} book - Thông tin sách
   * @returns {Object} Sách đã được thêm
   */
  static addBook(book) {
    const books = this.getBooks();
    const newBook = {
      ...book,
      id: this.generateNewBookId(books),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    books.push(newBook);
    this.saveBooks(books);
    return newBook;
  }

  /**
   * Cập nhật thông tin sách
   * @param {number} bookId - ID của sách
   * @param {Object} updatedData - Dữ liệu cập nhật
   * @returns {Object|null} Sách đã được cập nhật hoặc null nếu không tìm thấy
   */
  static updateBook(bookId, updatedData) {
    const books = this.getBooks();
    const index = books.findIndex(book => book.id === bookId);
    
    if (index === -1) {
      return null;
    }

    books[index] = {
      ...books[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    this.saveBooks(books);
    return books[index];
  }

  /**
   * Xóa sách
   * @param {number} bookId - ID của sách
   * @returns {boolean} True nếu xóa thành công
   */
  static deleteBook(bookId) {
    const books = this.getBooks();
    const filteredBooks = books.filter(book => book.id !== bookId);
    
    if (filteredBooks.length === books.length) {
      return false; // Không tìm thấy sách để xóa
    }
    
    this.saveBooks(filteredBooks);
    return true;
  }

  /**
   * Tìm sách theo ID
   * @param {number} bookId - ID của sách
   * @returns {Object|null} Sách tìm được hoặc null
   */
  static getBookById(bookId) {
    const books = this.getBooks();
    return books.find(book => book.id === bookId) || null;
  }

  /**
   * Tạo ID mới cho sách
   * @param {Array} books - Danh sách sách hiện tại
   * @returns {number} ID mới
   */
  static generateNewBookId(books = null) {
    const bookList = books || this.getBooks();
    if (bookList.length === 0) return 1;
    return Math.max(...bookList.map(book => book.id)) + 1;
  }

  /**
   * Khởi tạo dữ liệu mẫu nếu chưa có
   * @param {Array} mockBooks - Dữ liệu sách mẫu
   */
  static initializeBooksIfEmpty(mockBooks = []) {
    const existingBooks = this.getBooks();
    if (existingBooks.length === 0 && mockBooks.length > 0) {
      this.saveBooks(mockBooks);
    }
  }

  /**
   * Lấy thống kê sách
   * @returns {Object} Thống kê
   */
  static getBooksStats() {
    const books = this.getBooks();
    const categories = [...new Set(books.map(book => book.category))];
    const authors = [...new Set(books.map(book => book.author))];
    
    return {
      totalBooks: books.length,
      totalCategories: categories.length,
      totalAuthors: authors.length,
      categories,
      authors
    };
  }
}

// Export both class and legacy functions for backward compatibility
export default StorageService;

// Legacy exports for backward compatibility
export const getLanguage = StorageService.getLanguage;
export const setLanguage = StorageService.setLanguage;
export const getBooks = StorageService.getBooks;
export const saveBooks = StorageService.saveBooks;
