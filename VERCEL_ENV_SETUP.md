# Hướng dẫn thiết lập biến môi trường trên Vercel

## 🚀 Tổng quan
Sau khi deploy code lên Vercel, bạn cần thiết lập các biến môi trường để ứng dụng hoạt động đúng.

## ✅ Trạng thái hiện tại
- **Deployment URL:** `https://vue-mongo-db-docker.vercel.app`
- **API Status:** ✅ Hoạt động
- **Missing:** MongoDB URI và JWT Secret

## Các bước cần thực hiện:

### 1. Truy cập Vercel Dashboard
- Đi đến https://vercel.com/dashboard
- Chọn project `nheii`
- Vào tab **Settings** > **Environment Variables**

### 2. Thêm các biến môi trường sau:

#### Database Configuration ⚠️ THIẾU
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/digital_library_prod
```
**Lưu ý:** Bạn cần:
- Tạo MongoDB Atlas cluster miễn phí tại https://cloud.mongodb.com
- Thay thế `username`, `password`, và `cluster` bằng thông tin thực tế
- Whitelist IP `0.0.0.0/0` trong Network Access để Vercel có thể kết nối

#### JWT Configuration ⚠️ THIẾU
```
JWT_SECRET=your-super-secure-jwt-secret-key-for-production-replace-this
JWT_EXPIRES_IN=7d
```
**Lưu ý:** Thay thế bằng JWT secret mạnh (ít nhất 32 ký tự ngẫu nhiên)

#### Cách tạo JWT Secret:
```bash
# Sử dụng Node.js để tạo secret ngẫu nhiên
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Hoặc sử dụng online generator: [JWT Secret Generator](https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx)

#### Node Environment
```
NODE_ENV=production
```

### 3. Redeploy sau khi thêm biến môi trường
- Sau khi thêm tất cả biến môi trường
- Vào tab **Deployments**
- Click vào deployment mới nhất
- Click **Redeploy** để áp dụng biến môi trường mới

### 4. Kiểm tra API endpoints
Sau khi redeploy, test các endpoints:
- `https://nheii.vercel.app/api/test` - Kiểm tra API hoạt động
- `https://nheii.vercel.app/api/auth/register` - Test đăng ký
- `https://nheii.vercel.app/api/auth/login` - Test đăng nhập

## Lỗi thường gặp và cách khắc phục:

### 1. Lỗi 405 Method Not Allowed
- Đã được khắc phục bằng cách chuyển từ `export default` sang `module.exports`
- Đảm bảo tất cả file API sử dụng CommonJS syntax

### 2. Lỗi CORS
- Đã cập nhật CORS headers để hỗ trợ domain Vercel
- Nếu vẫn gặp lỗi, kiểm tra domain trong allowedOrigins

### 3. Lỗi Database Connection
- Đảm bảo MongoDB URI đúng format
- Kiểm tra Network Access trong MongoDB Atlas
- Verify username/password chính xác

### 4. Lỗi JWT
- Đảm bảo JWT_SECRET được set trong Vercel
- Secret phải đủ mạnh (ít nhất 32 ký tự)

## Monitoring và Debug

### Xem logs trên Vercel:
1. Vào project dashboard
2. Tab **Functions**
3. Click vào function cần debug
4. Xem **Invocations** và **Logs**

### Test local trước khi deploy:
```bash
# Set biến môi trường local
export MONGODB_URI="your-atlas-uri"
export JWT_SECRET="your-jwt-secret"

# Test API
npm run server
```

## Bảo mật

⚠️ **QUAN TRỌNG:**
- Không commit file `.env` chứa thông tin thực
- Sử dụng MongoDB Atlas thay vì localhost
- JWT secret phải unique và mạnh
- Regularly rotate JWT secrets
- Monitor access logs

## Liên hệ hỗ trợ
Nếu gặp vấn đề, kiểm tra:
1. Vercel function logs
2. MongoDB Atlas logs
3. Network connectivity
4. Environment variables spelling