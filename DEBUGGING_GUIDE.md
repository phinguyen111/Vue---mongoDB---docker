# 🔍 HƯỚNG DẪN KIỂM TRA VÀ DEBUG DATABASE

## 📊 TÌNH TRẠNG HIỆN TẠI

### ✅ Những gì HOẠT ĐỘNG:
- API registration trả về thành công
- API login với user mới đăng ký hoạt động
- Frontend có thể gọi API
- Database connection hoạt động bình thường

### ❌ VẤN ĐỀ CHÍNH:
**Users mới đăng ký KHÔNG được lưu vào database MongoDB!**

## 🔍 CÁCH KIỂM TRA DATABASE

### 1. Kiểm tra Database qua Script
```bash
# Chạy trong thư mục server
node scripts/directDBCheck.js
```

### 2. Kiểm tra Database qua MongoDB Compass
- Tải MongoDB Compass: https://www.mongodb.com/products/compass
- Kết nối với: `mongodb://localhost:27017`
- Chọn database: `nheii`
- Xem collection: `users`

### 3. Kiểm tra Database qua MongoDB Shell
```bash
# Mở MongoDB shell
mongosh

# Chọn database
use nheii

# Xem tất cả users
db.users.find().pretty()

# Đếm số users
db.users.countDocuments()

# Xem user mới nhất
db.users.findOne({}, {sort: {_id: -1}})
```

## 🐛 PHÂN TÍCH VẤN ĐỀ

### Hiện tượng:
1. API `/register` trả về success = true
2. API trả về user data với ID
3. Có thể login ngay sau khi register
4. Nhưng user KHÔNG xuất hiện trong database
5. Sau khi logout, không thể login lại

### Nguyên nhân có thể:
1. **Transaction Issue**: User được tạo trong memory nhưng không commit vào DB
2. **Connection Issue**: Kết nối database bị lỗi trong quá trình save
3. **Middleware Issue**: Pre-save middleware có lỗi
4. **Session Issue**: User chỉ tồn tại trong session, không persist

## 🔧 BƯỚC DEBUG

### Bước 1: Kiểm tra Server Logs
```bash
# Restart server để xem logs
npm start

# Trong terminal khác, test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Bước 2: Kiểm tra Database Connection
```javascript
// Thêm vào auth.js để debug
console.log('Database connection state:', mongoose.connection.readyState);
console.log('Database name:', mongoose.connection.db?.databaseName);
```

### Bước 3: Kiểm tra User Model
```javascript
// Kiểm tra User model có hoạt động không
const testUser = new User({name: 'Test', email: 'test@test.com', password: '123'});
console.log('User model created:', testUser);
```

## 🚨 VẤN ĐỀ NGHIÊM TRỌNG

**Đây là bug nghiêm trọng vì:**
- Users nghĩ họ đã đăng ký thành công
- Nhưng thực tế data không được lưu
- Dẫn đến frustration khi không thể login lại
- Mất dữ liệu user

## 💡 GIẢI PHÁP TẠM THỜI

1. **Sử dụng seeded users để test:**
   - admin@example.com / admin123
   - john@example.com / user123
   - jane@example.com / user123

2. **Thông báo cho users:**
   - Hiện tại có vấn đề với registration
   - Khuyến khích sử dụng demo accounts

## 📋 CHECKLIST DEBUG

- [ ] Kiểm tra server logs khi register
- [ ] Kiểm tra database connection state
- [ ] Kiểm tra User model validation
- [ ] Kiểm tra pre-save middleware
- [ ] Kiểm tra transaction handling
- [ ] Test với MongoDB Compass
- [ ] Kiểm tra environment variables
- [ ] Restart MongoDB service

## 🎯 MỤC TIÊU

Sửa bug để:
1. Users mới đăng ký được lưu vào database
2. Có thể login lại sau khi logout
3. Data persistence hoạt động đúng
4. Application hoạt động ổn định

---

**Ghi chú:** Vấn đề này cần được ưu tiên cao vì ảnh hưởng trực tiếp đến user experience và data integrity.