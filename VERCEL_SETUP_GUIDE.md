# 🚀 Hướng dẫn thiết lập Environment Variables trên Vercel

## ⚠️ Vấn đề hiện tại

**Registration API đang trả về HTTP 500** do thiếu environment variables:
- ❌ `MONGODB_URI` - Không có
- ❌ `JWT_SECRET` - Không có

## ✅ Trạng thái deployment

- **URL:** https://vue-mongo-db-docker.vercel.app
- **API Status:** ✅ Hoạt động (Books API có 463 records)
- **Auth API:** ❌ Lỗi 500 do thiếu env vars

## 🔧 Bước 1: Tạo JWT Secret

```bash
node generate-vercel-secrets.js
```

**Output sẽ như này:**
```
🔐 Generating secrets for Vercel deployment...
============================================================

📝 JWT_SECRET:
[một chuỗi dài 128 ký tự]

📝 MONGODB_URI (template):
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/digital_library_prod?retryWrites=true&w=majority
```

## 🔧 Bước 2: Thiết lập MongoDB Atlas

1. **Truy cập:** [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Đăng ký/Đăng nhập** tài khoản miễn phí
3. **Tạo cluster mới:**
   - Chọn "Build a Database"
   - Chọn "M0 Sandbox" (Free tier)
   - Chọn region gần nhất
4. **Tạo database user:**
   - Username: `admin` (hoặc tên khác)
   - Password: Tạo password mạnh
5. **Whitelist IP:**
   - Add IP: `0.0.0.0/0` (cho phép tất cả IP)
6. **Lấy connection string:**
   - Click "Connect"
   - Chọn "Connect your application"
   - Copy connection string
   - Thay `<password>` bằng password thực

**Ví dụ connection string:**
```
mongodb+srv://admin:yourpassword@cluster0.abc123.mongodb.net/digital_library_prod?retryWrites=true&w=majority
```

## 🔧 Bước 3: Thêm Environment Variables vào Vercel

1. **Truy cập:** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Chọn project:** `vue-mongo-db-docker`
3. **Vào Settings:** Click tab "Settings"
4. **Environment Variables:** Click "Environment Variables" trong sidebar
5. **Thêm các biến sau:**

### Variable 1: JWT_SECRET
- **Name:** `JWT_SECRET`
- **Value:** [Chuỗi từ generate-vercel-secrets.js]
- **Environment:** Production, Preview, Development

### Variable 2: MONGODB_URI
- **Name:** `MONGODB_URI`
- **Value:** [Connection string từ MongoDB Atlas]
- **Environment:** Production, Preview, Development

### Variable 3: JWT_EXPIRES_IN
- **Name:** `JWT_EXPIRES_IN`
- **Value:** `7d`
- **Environment:** Production, Preview, Development

### Variable 4: NODE_ENV
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environment:** Production

## 🔧 Bước 4: Redeploy Project

1. **Trong Vercel Dashboard:**
   - Vào tab "Deployments"
   - Click "..." trên deployment mới nhất
   - Chọn "Redeploy"

2. **Hoặc push code mới:**
   ```bash
   git commit --allow-empty -m "trigger redeploy"
   git push origin main
   ```

## 🧪 Bước 5: Kiểm tra

```bash
# Kiểm tra environment variables
node test-env-check.js

# Kiểm tra registration API
node test-registration-detailed.js

# Kiểm tra tất cả API
node test-vercel-api.js
```

**Kết quả mong đợi:**
- ✅ `hasMongoUri: true`
- ✅ `hasJwtSecret: true`
- ✅ Registration API trả về 201 với token
- ✅ Login API hoạt động

## 🎯 Troubleshooting

### Lỗi "Database connection failed"
- Kiểm tra MONGODB_URI có đúng format không
- Kiểm tra password trong connection string
- Kiểm tra IP whitelist (0.0.0.0/0)

### Lỗi "JWT_SECRET not configured"
- Kiểm tra JWT_SECRET đã được thêm vào Vercel
- Kiểm tra environment đã chọn đúng (Production)
- Redeploy project

### API vẫn trả về 500
- Chờ 1-2 phút sau khi redeploy
- Kiểm tra Vercel function logs
- Test lại với `node test-env-check.js`

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề, chạy:
```bash
node test-env-check.js
```

Và gửi kết quả để được hỗ trợ.