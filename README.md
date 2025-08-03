# 📚 Digital Library Management System

> A modern, full-stack digital library management system built with Vue.js and Node.js

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![Vue.js](https://img.shields.io/badge/vue.js-3.x-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-7.0+-green.svg)

## ✨ Features

### 📖 Book Management
- **CRUD Operations**: Create, read, update, and delete books
- **Advanced Search**: Search by title, author, genre, or ISBN
- **Category Management**: Organize books by categories and genres
- **Book Details**: Comprehensive book information with cover images
- **Inventory Tracking**: Monitor book availability and stock levels

### 👥 User Management
- **User Registration & Authentication**: Secure JWT-based authentication
- **Role-based Access Control**: Admin, Librarian, and Member roles
- **User Profiles**: Manage user information and preferences
- **Account Status Management**: Enable/disable user accounts

### 🔐 Admin Dashboard
- **Comprehensive Analytics**: User statistics and book metrics
- **User Management**: Full CRUD operations for user accounts
- **System Monitoring**: Health checks and performance metrics
- **Role Assignment**: Manage user permissions and roles

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first, works on all devices
- **Dark/Light Theme**: User preference-based theming
- **Intuitive Interface**: Clean, modern design with excellent UX
- **Accessibility**: WCAG 2.1 AA compliant

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** 7.0+ ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nheii
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp .env.development .env
   
   # Edit .env file with your configuration
   # Minimum required:
   MONGODB_URI=mongodb://localhost:27017/digital_library
   JWT_SECRET=your-secret-key
   ```

4. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

5. **Initialize database**
   ```bash
   npm run seed
   ```

6. **Start development servers**
   ```bash
   # Terminal 1: Start backend
   npm run server:dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start frontend development server
npm run server:dev       # Start backend with nodemon
npm run start:dev        # Start both frontend and backend

# Building
npm run build            # Build frontend for production
npm run build:prod       # Build with production optimizations
npm run preview          # Preview production build

# Database
npm run seed             # Seed database with sample data
npm run db:reset         # Reset database

# Testing
npm test                 # Run all tests
npm run test:api         # Test API endpoints
npm run health-check     # Check application health

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Production
npm run start            # Start production server
npm run server:prod      # Start server in production mode

# Process Management (PM2)
npm run pm2:start        # Start with PM2
npm run pm2:stop         # Stop PM2 processes
npm run pm2:restart      # Restart PM2 processes
npm run pm2:logs         # View PM2 logs
```

### Project Structure

```
nheii/
├── src/                    # Frontend source code
│   ├── components/         # Vue components
│   ├── views/             # Page components
│   ├── services/          # API services
│   ├── stores/            # Pinia stores
│   ├── router/            # Vue Router configuration
│   └── assets/            # Static assets
├── server/                # Backend source code
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── middleware/        # Express middleware
│   └── utils/             # Utility functions
├── public/                # Public static files
├── dist/                  # Built frontend files
├── logs/                  # Application logs
└── docs/                  # Documentation
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3000` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/digital_library` | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` | No |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:5173` | No |
| `BCRYPT_ROUNDS` | Password hashing rounds | `10` | No |

### API Configuration

```javascript
// src/services/config.js
export const API_CONFIG = {
  useApi: false,  // Set to true to use real API
  baseURL: 'http://localhost:3000/api',
  timeout: 10000
}
```

## 📡 API Documentation

### Authentication

```bash
# Register
POST /api/auth/register
Content-Type: application/json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

# Login
POST /api/auth/login
Content-Type: application/json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Books

```bash
# Get all books
GET /api/books

# Get book by ID
GET /api/books/:id

# Create book (Admin only)
POST /api/books
Authorization: Bearer <token>

# Update book (Admin only)
PUT /api/books/:id
Authorization: Bearer <token>

# Delete book (Admin only)
DELETE /api/books/:id
Authorization: Bearer <token>
```

### Users (Admin only)

```bash
# Get all users
GET /api/users
Authorization: Bearer <token>

# Update user
PUT /api/users/:id
Authorization: Bearer <token>

# Delete user
DELETE /api/users/:id
Authorization: Bearer <token>

# Toggle user status
PATCH /api/users/:id/toggle-status
Authorization: Bearer <token>
```

## 🚀 Production Deployment

### ✅ Vercel Deployment Status
- **Live URL:** [https://vue-mongo-db-docker.vercel.app](https://vue-mongo-db-docker.vercel.app)
- **API Status:** ✅ Hoạt động
- **Missing:** MongoDB URI và JWT Secret

### 🔧 Setup Environment Variables
1. Run the secret generator:
   ```bash
   node generate-vercel-secrets.js
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Select project: `vue-mongo-db-docker`
4. Go to Settings > Environment Variables
5. Add the generated variables
6. Redeploy the project

**Environment Variables needed:**
- `MONGODB_URI`: MongoDB Atlas connection string ⚠️ **MISSING**
- `JWT_SECRET`: Generated secret key ⚠️ **MISSING**
- `JWT_EXPIRES_IN`: 7d
- `NODE_ENV`: production

For detailed production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Production Setup

```bash
# Using Docker (Recommended)
docker-compose up -d

# Using PM2
npm run build:prod
npm run pm2:start

# Manual
npm ci --only=production
npm run build:prod
npm start
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run API tests
npm run test:api

# Run with coverage
npm run test:coverage
```

### Test Accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@library.com | admin123 |
| Librarian | librarian@library.com | librarian123 |
| Member | user@library.com | user123 |

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vue.js** - The progressive JavaScript framework
- **Express.js** - Fast, unopinionated web framework for Node.js
- **MongoDB** - The database for modern applications
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - A utility-first CSS framework

## 📞 Support

If you have any questions or need help:

1. **Check the documentation** in the `/docs` folder
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Contact the development team**

---

**Made with ❤️ by the Digital Library Team**

> "A library is not a luxury but one of the necessities of life." - Henry Ward Beecher
