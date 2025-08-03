const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề sách là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
  },
  author: {
    type: String,
    required: [true, 'Tác giả là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên tác giả không được vượt quá 100 ký tự']
  },
  category: {
    type: String,
    required: [true, 'Thể loại là bắt buộc'],
    enum: [
      'Chọn thể loại',
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
    ]
  },
  year: {
    type: Number,
    required: [true, 'Năm xuất bản là bắt buộc'],
    min: [1000, 'Năm xuất bản không hợp lệ'],
    max: [new Date().getFullYear() + 1, 'Năm xuất bản không được vượt quá năm hiện tại']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Mô tả không được vượt quá 2000 ký tự']
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    match: [/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'ISBN không hợp lệ']
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Nhà xuất bản không được vượt quá 100 ký tự']
  },
  pages: {
    type: Number,
    min: [1, 'Số trang phải lớn hơn 0']
  },
  language: {
    type: String,
    default: 'Vietnamese',
    enum: ['Vietnamese', 'English', 'French', 'German', 'Chinese', 'Japanese', 'Korean']
  },
  cover: {
    type: String,
    default: '/default-book-cover.svg'
  },
  rating: {
    type: Number,
    min: [0, 'Đánh giá không được nhỏ hơn 0'],
    max: [5, 'Đánh giá không được lớn hơn 5'],
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Bình luận không được vượt quá 500 ký tự']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: false },
  toObject: { virtuals: false }
});

// Indexes for better performance
// Regular indexes for search (avoiding text index language issues)
// bookSchema.index({ title: 'text', author: 'text', description: 'text' }, { default_language: 'none' });
bookSchema.index({ category: 1 });
bookSchema.index({ year: 1 });
bookSchema.index({ featured: 1 });
bookSchema.index({ rating: -1 });
bookSchema.index({ createdAt: -1 });

// Virtual properties removed to prevent serialization errors

// Instance method to add review
bookSchema.methods.addReview = function(userId, rating, comment) {
  // Remove existing review from same user
  this.reviews = this.reviews.filter(review => !review.user.equals(userId));
  
  // Add new review
  this.reviews.push({
    user: userId,
    rating,
    comment
  });
  
  // Update book rating
  this.rating = this.averageRating;
  
  return this.save();
};

// Instance method to increment view count
bookSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to increment download count
bookSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  return this.save();
};

// Static method to get featured books
bookSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ featured: true, isActive: true })
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .populate('reviews.user', 'name');
};

// Static method to search books
bookSchema.statics.searchBooks = function(query, options = {}) {
  const {
    category,
    year,
    minRating,
    sortBy = 'createdAt',
    sortOrder = -1,
    page = 1,
    limit = 10
  } = options;

  let searchQuery = { isActive: true };

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Category filter
  if (category && category !== 'all') {
    searchQuery.category = category;
  }

  // Year filter
  if (year && year !== 'all') {
    searchQuery.year = parseInt(year);
  }

  // Rating filter
  if (minRating) {
    searchQuery.rating = { $gte: parseFloat(minRating) };
  }

  const skip = (page - 1) * limit;

  return this.find(searchQuery)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('reviews.user', 'name');
};

// Static method to get book statistics
bookSchema.statics.getStats = async function() {
  const totalBooks = await this.countDocuments({ isActive: true });
  const featuredBooks = await this.countDocuments({ featured: true, isActive: true });
  
  const categoryStats = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const yearStats = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$year', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);
  
  const avgRating = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  return {
    totalBooks,
    featuredBooks,
    totalCategories: categoryStats.length,
    averageRating: avgRating[0]?.avgRating || 0,
    categoryStats,
    yearStats
  };
};

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;