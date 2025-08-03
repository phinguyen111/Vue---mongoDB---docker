# 🚀 HƯỚNG DẪN CHẠY BACKEND VÀ FRONTEND CÙNG LÚC

## 📊 TÌNH TRẠNG HIỆN TẠI

✅ **Backend đang chạy:**
- Port: `http://localhost:3000`
- Command: `node server.js`
- Terminal: 4
- Status: Running

✅ **Frontend đang chạy:**
- Port: `http://localhost:5176` (tự động chuyển port)
- Command: `npm run dev`
- Terminal: 3
- Status: Running

## 🎯 CÁC CÁCH CHẠY CẢ HAI CÙNG LÚC

### Phương pháp 1: Sử dụng 2 Terminal riêng biệt (KHUYẾN NGHỊ)

**Terminal 1 - Backend:**
```bash
# Di chuyển vào thư mục server
cd d:\PhiNguyen\Project\nheii

# Chạy backend server
node server.js
# HOẶC
npm start
```

**Terminal 2 - Frontend:**
```bash
# Ở thư mục root
cd d:\PhiNguyen\Project\nheii

# Chạy frontend development server
npm run dev
```

### Phương pháp 2: Sử dụng concurrently (Chạy 1 lệnh)

**Bước 1: Cài đặt concurrently**
```bash
npm install --save-dev concurrently
```

**Bước 2: Thêm script vào package.json**
```json
{
  "scripts": {
    "dev:full": "concurrently \"node server.js\" \"npm run dev\"",
    "dev:both": "concurrently --names \"BACKEND,FRONTEND\" --prefix-colors \"blue,green\" \"node server.js\" \"npm run dev\""
  }
}
```

**Bước 3: Chạy cả hai**
```bash
npm run dev:both
```

### Phương pháp 3: Sử dụng npm-run-all

**Bước 1: Cài đặt npm-run-all**
```bash
npm install --save-dev npm-run-all
```

**Bước 2: Cấu hình scripts**
```json
{
  "scripts": {
    "start:backend": "node server.js",
    "start:frontend": "npm run dev",
    "start:all": "npm-run-all --parallel start:backend start:frontend"
  }
}
```

**Bước 3: Chạy**
```bash
npm run start:all
```

## 🔧 QUẢN LÝ TERMINALS

### Kiểm tra trạng thái servers:
```bash
# Kiểm tra port đang sử dụng
netstat -ano | findstr :3000  # Backend
netstat -ano | findstr :5173  # Frontend (hoặc 5174, 5175, 5176)

# Kiểm tra process
tasklist | findstr node
```

### Dừng servers:
```bash
# Trong terminal đang chạy: Ctrl + C
# Hoặc kill process bằng PID
taskkill /PID <process_id> /F
```

## 📱 TRUY CẬP ỨNG DỤNG

**Frontend (Vue.js):**
- URL: `http://localhost:5176/` (hoặc port được hiển thị)
- Features: UI/UX, user interface

**Backend API:**
- URL: `http://localhost:3000/api`
- Endpoints: `/auth`, `/books`, `/users`
- Health check: `http://localhost:3000/api/health`

## 🚨 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi "Port already in use":
```bash
# Tìm process đang sử dụng port
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Hoặc thay đổi port trong .env
PORT=3001
```

### Lỗi "EADDRINUSE":
- Restart terminal
- Thay đổi port
- Kill existing processes

### Frontend không kết nối được Backend:
- Kiểm tra CORS settings
- Verify API base URL trong frontend
- Check network connectivity

## 💡 TIPS & BEST PRACTICES

### 1. Sử dụng Environment Variables:
```bash
# .env cho backend
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nheii

# .env cho frontend
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Development Workflow:
```bash
# Bước 1: Start MongoDB
net start MongoDB

# Bước 2: Start Backend
node server.js

# Bước 3: Start Frontend (terminal mới)
npm run dev

# Bước 4: Open browser
# Frontend: http://localhost:5176
# API: http://localhost:3000/api
```

### 3. Debugging:
```bash
# Backend logs
tail -f server/logs/app.log

# Frontend dev tools
# F12 -> Console -> Network tab

# API testing
curl http://localhost:3000/api/health
```

## 📋 CHECKLIST STARTUP

- [ ] MongoDB service đang chạy
- [ ] Backend server started (port 3000)
- [ ] Frontend dev server started (port 5173+)
- [ ] No port conflicts
- [ ] Environment variables loaded
- [ ] Database connection successful
- [ ] API endpoints responding
- [ ] Frontend can call backend APIs

## 🎯 QUICK START COMMANDS

**Cách nhanh nhất (2 terminals):**

**Terminal 1:**
```bash
cd d:\PhiNguyen\Project\nheii && node server.js
```

**Terminal 2:**
```bash
cd d:\PhiNguyen\Project\nheii && npm run dev
```

**Hoặc sử dụng PowerShell:**
```powershell
# Terminal 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\PhiNguyen\Project\nheii'; node server.js"

# Terminal 2  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\PhiNguyen\Project\nheii'; npm run dev"
```

---

**Ghi chú:** Hiện tại cả backend và frontend đã đang chạy thành công. Bạn có thể truy cập ứng dụng tại `http://localhost:5176/`
# Setup development environment
docker-compose -f docker-compose.dev.yml up -d

# Run security audit
npm run security:audit

# Optimize database
npm run db:optimize

# Setup Redis
npm run redis:setup

# Full maintenance
npm run maintenance:full