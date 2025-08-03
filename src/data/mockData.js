export const mockBooks = [
  {
    id: 1,
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    category: 'Tâm lý học',
    year: 2018,
    cover: '/placeholder.svg?height=300&width=200',
    description: 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử.',
    isbn: '978-0-123456-78-9',
    publisher: 'NXB Trẻ',
    pages: 320,
    language: 'Tiếng Việt',
    rating: 4.8,
    featured: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    title: 'Sapiens: Lược sử loài người',
    author: 'Yuval Noah Harari',
    category: 'Lịch sử',
    year: 2020,
    cover: '/placeholder.svg?height=300&width=200',
    description: 'Câu chuyện về sự tiến hóa của loài người từ thời tiền sử đến hiện đại.',
    isbn: '978-0-123456-78-8',
    publisher: 'NXB Thế Giới',
    pages: 512,
    language: 'Tiếng Việt',
    rating: 4.6,
    featured: false,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  },
  {
    id: 3,
    title: 'Tôi Tài Giỏi, Bạn Cũng Thế',
    author: 'Adam Khoo',
    category: 'Kỹ năng sống',
    year: 2019,
    cover: '/placeholder.svg?height=300&width=200',
    description: 'Hướng dẫn phát triển tư duy và kỹ năng học tập hiệu quả.',
    isbn: '978-0-123456-78-7',
    publisher: 'NXB Tổng Hợp',
    pages: 280,
    language: 'Tiếng Việt',
    rating: 4.3,
    featured: false,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z'
  },
  {
    id: 4,
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    category: 'Tiểu thuyết',
    year: 2017,
    cover: '/placeholder.svg?height=300&width=200',
    description: 'Câu chuyện về hành trình tìm kiếm kho báu và ý nghĩa cuộc sống.',
    isbn: '978-0-123456-78-6',
    publisher: 'NXB Văn Học',
    pages: 208,
    language: 'Tiếng Việt',
    rating: 4.7,
    featured: true,
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z'
  },
  {
    id: 5,
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Kỹ năng sống',
    year: 2021,
    cover: '/placeholder.svg?height=300&width=200',
    description: 'Cách xây dựng thói quen tốt và loại bỏ thói quen xấu.',
    isbn: '978-0-123456-78-5',
    publisher: 'NXB Thế Giới',
    pages: 352,
    language: 'Tiếng Việt',
    rating: 4.9,
    featured: true,
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z'
  },
  {
    id: 6,
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Tâm lý học',
    year: 2016,
    cover: '/placeholder.svg?height=300&width=200',
    description: 'Khám phá cách thức hoạt động của tư duy con người.',
    isbn: '978-0-123456-78-4',
    publisher: 'NXB Tri Thức',
    pages: 624,
    language: 'Tiếng Việt',
    rating: 4.4,
    featured: false,
    createdAt: '2024-01-06T00:00:00.000Z',
    updatedAt: '2024-01-06T00:00:00.000Z'
  }
];

export const mockUsers = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@library.com',
    password: 'admin123',
    role: 'admin',
    favorites: [],
    history: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'Nguyễn Văn A',
    email: 'user@library.com',
    password: 'user123',
    role: 'user',
    favorites: [1, 3, 5],
    history: [
      {
        id: 1,
        action: 'Thêm vào yêu thích',
        bookTitle: 'Đắc Nhân Tâm',
        icon: 'fas fa-heart text-danger',
        date: '2024-01-15T10:30:00.000Z'
      },
      {
        id: 2,
        action: 'Xem chi tiết',
        bookTitle: 'Sapiens: Lược sử loài người',
        icon: 'fas fa-eye text-primary',
        date: '2024-01-15T11:00:00.000Z'
      }
    ],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-15T11:00:00.000Z'
  }
];

export const categories = [
  'Tâm lý học',
  'Lịch sử', 
  'Kỹ năng sống',
  'Tiểu thuyết',
  'Khoa học',
  'Kinh tế',
  'Công nghệ',
  'Triết học',
  'Văn học',
  'Nghệ thuật'
];

export const translations = {
  vi: {
    // Navigation
    digitalLibrary: 'Thư Viện Số',
    library: 'Thư viện sách',
    home: 'Trang chủ',
    favorites: 'Yêu thích',
    history: 'Lịch sử',
    admin: 'Quản trị',
    profile: 'Hồ sơ',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    logout: 'Đăng xuất',
    
    // Hero
    welcomeToLibrary: 'Chào mừng đến với Thư viện số',
    discoverBooks: 'Khám phá hàng ngàn cuốn sách hay từ khắp nơi trên thế giới',
    findYourBook: 'Tìm cuốn sách của bạn',
    
    // Search & Filter
    search: 'Tìm kiếm',
    searchPlaceholder: 'Tìm kiếm sách theo tên, tác giả...',
    category: 'Thể loại',
    allCategories: 'Tất cả thể loại',
    year: 'Năm XB',
    allYears: 'Tất cả năm',
    sortBy: 'Sắp xếp',
    filter: 'Lọc',
    clearFilters: 'Xóa bộ lọc',
    
    // Book info
    bookTitle: 'Tên sách',
    author: 'Tác giả',
    publishYear: 'Năm xuất bản',
    description: 'Mô tả',
    cover: 'Ảnh bìa',
    books: 'cuốn',
    
    // Actions
    viewDetails: 'Xem chi tiết',
    addFavorite: 'Yêu thích',
    removeFavorite: 'Bỏ yêu thích',
    edit: 'Chỉnh sửa',
    delete: 'Xóa',
    save: 'Lưu',
    cancel: 'Hủy',
    close: 'Đóng',
    goBack: 'Quay lại',
    
    // Forms
    email: 'Email',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    fullName: 'Họ tên',
    enterEmail: 'Nhập email của bạn',
    enterPassword: 'Nhập mật khẩu',
    reenterPassword: 'Nhập lại mật khẩu',
    enterFullName: 'Nhập họ tên',
    
    // Messages
    welcomeBack: 'Chào mừng trở lại với Thư viện số',
    createAccount: 'Tạo tài khoản mới để trải nghiệm',
    noAccount: 'Chưa có tài khoản?',
    registerNow: 'Đăng ký ngay',
    haveAccount: 'Đã có tài khoản?',
    loginHere: 'Đăng nhập',
    noBooks: 'Không tìm thấy sách nào',
    tryDifferentSearch: 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc',
    noFavorites: 'Chưa có sách yêu thích',
    addFavoritesMessage: 'Hãy thêm những cuốn sách bạn yêu thích vào danh sách này',
    exploreBooks: 'Khám phá sách',
    noActivity: 'Chưa có hoạt động nào',
    activityMessage: 'Hoạt động của bạn sẽ được hiển thị tại đây',
    
    // Toast messages
    loginSuccess: 'Đăng nhập thành công!',
    loginError: 'Email hoặc mật khẩu không đúng!',
    registerSuccess: 'Đăng ký thành công!',
    logoutSuccess: 'Đã đăng xuất!',
    passwordMismatch: 'Mật khẩu xác nhận không khớp!',
    emailExists: 'Email đã được sử dụng!',
    loginRequired: 'Vui lòng đăng nhập để sử dụng tính năng này!',
    addedToFavorites: 'Đã thêm vào danh sách yêu thích!',
    removedFromFavorites: 'Đã bỏ khỏi danh sách yêu thích!'
  },
  en: {
    // Navigation
    digitalLibrary: 'Digital Library',
    library: 'Book Library',
    home: 'Home',
    favorites: 'Favorites',
    history: 'History',
    admin: 'Admin',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    
    // Hero
    welcomeToLibrary: 'Welcome to Digital Library',
    discoverBooks: 'Discover thousands of great books from around the world',
    findYourBook: 'Find your book',
    
    // Search & Filter
    search: 'Search',
    searchPlaceholder: 'Search books by title, author...',
    category: 'Category',
    allCategories: 'All Categories',
    year: 'Year',
    allYears: 'All Years',
    sortBy: 'Sort By',
    filter: 'Filter',
    clearFilters: 'Clear Filters',
    
    // Book info
    bookTitle: 'Book Title',
    author: 'Author',
    publishYear: 'Publish Year',
    description: 'Description',
    cover: 'Cover',
    books: 'books',
    
    // Actions
    viewDetails: 'View Details',
    addFavorite: 'Add to Favorites',
    removeFavorite: 'Remove from Favorites',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    goBack: 'Go Back',
    
    // Forms
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter password',
    reenterPassword: 'Re-enter password',
    enterFullName: 'Enter full name',
    
    // Messages
    welcomeBack: 'Welcome back to Digital Library',
    createAccount: 'Create new account to experience',
    noAccount: "Don't have an account?",
    registerNow: 'Register now',
    haveAccount: 'Already have an account?',
    loginHere: 'Login here',
    noBooks: 'No books found',
    tryDifferentSearch: 'Try different search terms or filters',
    noFavorites: 'No favorite books yet',
    addFavoritesMessage: 'Add your favorite books to this list',
    exploreBooks: 'Explore Books',
    noActivity: 'No activity yet',
    activityMessage: 'Your activities will be displayed here',
    
    // Toast messages
    loginSuccess: 'Login successful!',
    loginError: 'Invalid email or password!',
    registerSuccess: 'Registration successful!',
    logoutSuccess: 'Logged out successfully!',
    passwordMismatch: 'Password confirmation does not match!',
    emailExists: 'Email already exists!',
    loginRequired: 'Please login to use this feature!',
    addedToFavorites: 'Added to favorites!',
    removedFromFavorites: 'Removed from favorites!'
  }
};