# Database Integration Setup Guide

## 📋 Tổng quan

Hệ thống đã được tích hợp MongoDB với các tính năng:
- ✅ User Authentication & Authorization
- ✅ Book Management với đầy đủ CRUD operations
- ✅ Review & Rating system
- ✅ Favorites & Reading History
- ✅ Advanced Search & Filtering
- ✅ Admin Dashboard functionality

## 🛠️ Cài đặt

### 1. Cài đặt MongoDB

**Windows:**
```bash
# Download và cài đặt MongoDB Community Server từ:
# https://www.mongodb.com/try/download/community

# Hoặc sử dụng chocolatey:
choco install mongodb

# Khởi động MongoDB service:
net start MongoDB
```

**macOS:**
```bash
# Sử dụng Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Khởi động MongoDB:
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu):**
```bash
# Import MongoDB public GPG key:
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository:
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB:
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB:
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Cấu hình Environment Variables

File `.env` đã được cấu hình với các biến:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/library_management
DB_NAME=library_management

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# API
VITE_API_URL=http://localhost:3000/api
```

### 3. Cài đặt Dependencies

```bash
# Đã cài đặt:
npm install mongoose dotenv bcryptjs axios
```

## 🌱 Seed Database

### Chạy Seed Script

```bash
# Seed dữ liệu mẫu vào database:
npm run seed

# Hoặc:
npm run db:reset
```

### Dữ liệu mẫu bao gồm:

**Users:**
- **Admin:** admin@example.com / admin123
- **User 1:** john@example.com / user123  
- **User 2:** jane@example.com / user123

**Books:** 8 cuốn sách mẫu với đầy đủ thông tin
**Reviews:** Đánh giá mẫu cho một số sách
**Favorites & History:** Dữ liệu yêu thích và lịch sử đọc

## 🧪 Testing

### 1. Kiểm tra MongoDB Connection

```bash
# Kiểm tra MongoDB đang chạy:
mongosh

# Trong MongoDB shell:
show dbs
use library_management
show collections
db.users.find()
db.books.find()
```

### 2. Test API Endpoints

```bash
# Chạy server:
npm run server

# Trong terminal khác, test API:
npm run test:api

# Hoặc:
npm test
```

### 3. Manual Testing với curl

```bash
# Health check:
curl http://localhost:3000/api/health

# Get books:
curl http://localhost:3000/api/books

# Login:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get books with auth (replace TOKEN):
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/books
```

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  favorites: [ObjectId] (ref: Book),
  history: [{
    book: ObjectId (ref: Book),
    accessedAt: Date
  }],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Book Model
```javascript
{
  title: String (required),
  author: String (required),
  category: String (required),
  year: Number (required),
  description: String,
  isbn: String (unique),
  publisher: String,
  pages: Number,
  language: String,
  cover: String,
  rating: Number (default: 0),
  featured: Boolean (default: false),
  isActive: Boolean (default: true),
  downloadCount: Number (default: 0),
  viewCount: Number (default: 0),
  tags: [String],
  reviews: [{
    user: ObjectId (ref: User),
    rating: Number (1-5),
    comment: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile (auth required)
- `PUT /api/auth/profile` - Cập nhật profile (auth required)
- `POST /api/auth/change-password` - Đổi mật khẩu (auth required)
- `POST /api/auth/logout` - Đăng xuất (auth required)

### Books
- `GET /api/books` - Lấy danh sách sách (có filter, search, pagination)
- `GET /api/books/featured` - Lấy sách nổi bật
- `GET /api/books/categories` - Lấy danh sách categories
- `GET /api/books/stats` - Thống kê sách (admin)
- `GET /api/books/search/suggestions` - Gợi ý tìm kiếm
- `GET /api/books/:id` - Lấy chi tiết sách
- `POST /api/books` - Tạo sách mới (admin only)
- `PUT /api/books/:id` - Cập nhật sách (admin only)
- `DELETE /api/books/:id` - Xóa sách (admin only)
- `POST /api/books/:id/reviews` - Thêm review (auth required)
- `POST /api/books/:id/favorite` - Toggle favorite (auth required)
- `POST /api/books/:id/history` - Thêm vào lịch sử (auth required)

### System
- `GET /api/health` - Health check

## 🚀 Deployment Notes

### Production Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library_management
JWT_SECRET=your-super-secure-production-jwt-secret
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

### Security Considerations
- ✅ Password hashing với bcrypt
- ✅ JWT token authentication
- ✅ Input validation
- ✅ Error handling
- ✅ CORS configuration
- ✅ Environment variables cho sensitive data

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Kiểm tra MongoDB service:
# Windows:
net start MongoDB

# macOS:
brew services start mongodb/brew/mongodb-community

# Linux:
sudo systemctl start mongod
```

### Common Errors
1. **MongooseError: Operation buffering timed out**
   - Kiểm tra MongoDB đang chạy
   - Kiểm tra connection string trong .env

2. **ValidationError**
   - Kiểm tra required fields trong request body
   - Xem console logs để biết chi tiết

3. **JWT Token Issues**
   - Kiểm tra JWT_SECRET trong .env
   - Đảm bảo token được gửi trong Authorization header

### Debug Mode
```bash
# Chạy với debug logs:
DEBUG=* npm run server

# Hoặc chỉ MongoDB logs:
DEBUG=mongoose:* npm run server
```

## ✅ Verification Checklist

- [ ] MongoDB đã cài đặt và chạy
- [ ] Dependencies đã cài đặt
- [ ] File .env đã cấu hình
- [ ] Seed data thành công
- [ ] API tests pass
- [ ] Server khởi động không lỗi
- [ ] Frontend có thể connect tới API
- [ ] Authentication hoạt động
- [ ] CRUD operations hoạt động

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Console logs của server
2. MongoDB logs
3. Network tab trong browser DevTools
4. API response status codes

Chúc bạn setup thành công! 🎉