# Vercel Deployment Guide

## 🚀 Deployment Steps

### 1. Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Project built successfully locally

### 2. Build Configuration
The project is configured with:
- `vite.config.js` - Vite build configuration
- `vercel.json` - Vercel deployment configuration
- `.vercelignore` - Files to exclude from deployment

### 3. Deploy to Vercel

#### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Via GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Vercel will automatically deploy on push to main branch

### 4. Build Commands
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Environment Variables
For production deployment, set these in Vercel dashboard:

**Required Environment Variables:**
- `NODE_ENV=production`
- `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nheii?retryWrites=true&w=majority`
- `JWT_SECRET=your-super-secret-jwt-key-here`

**How to set Environment Variables on Vercel:**
1. Go to your project dashboard on Vercel
2. Navigate to Settings → Environment Variables
3. Add each variable:
   - Variable Name: `MONGODB_URI`
   - Value: Your MongoDB Atlas connection string
   - Environment: Production (and Preview if needed)
   
   - Variable Name: `JWT_SECRET`
   - Value: A secure random string (at least 32 characters)
   - Environment: Production (and Preview if needed)

**Important Notes:**
- Replace `username`, `password`, and `cluster` in MONGODB_URI with your actual MongoDB Atlas credentials
- Generate a strong JWT_SECRET using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Never commit these values to your repository

### 6. Troubleshooting

#### Common Issues:
1. **"Could not resolve entry module index.html"**
   - ✅ Fixed: Moved `index.html` to root directory
   - ✅ Fixed: Added `rollupOptions.input` in vite.config.js

2. **Build fails**
   - Check `npm run build` works locally
   - Verify all dependencies are in package.json

3. **404 on routes**
   - ✅ Fixed: Added SPA routing in vercel.json

4. **API endpoints not working**
   - Verify environment variables are set correctly in Vercel dashboard
   - Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Vercel)
   - Ensure MongoDB Atlas user has read/write permissions
   - Check function logs in Vercel dashboard for errors

5. **Database connection fails**
   - Verify MONGODB_URI format is correct
   - Check MongoDB Atlas cluster is running
   - Ensure network access is configured for Vercel IPs
   - Test connection string locally first

6. **JWT authentication issues**
   - Verify JWT_SECRET is set and matches between environments
   - Check token expiration settings
   - Ensure CORS is properly configured

### 7. Verification
After deployment:
- ✅ Build completes successfully
- ✅ Static files served correctly
- ✅ Vue.js app loads
- ✅ Routing works for SPA
- ✅ API endpoints respond correctly
- ✅ Database connection established
- ✅ Authentication works
- ✅ CRUD operations function properly

**Test API Endpoints:**
- `GET /api/books` - Should return books list
- `POST /api/auth/login` - Should authenticate users
- `POST /api/auth/register` - Should create new users
- `GET /api/users/profile` - Should return user profile (with auth)

## 📁 Key Files

**Frontend:**
- `index.html` - Entry point (moved to root)
- `vite.config.js` - Build configuration
- `package.json` - Build scripts and dependencies

**Backend API (Serverless Functions):**
- `api/auth.js` - Authentication endpoints (login/register)
- `api/books.js` - Books CRUD operations
- `api/users.js` - User management endpoints
- `api/package.json` - API dependencies

**Deployment Configuration:**
- `vercel.json` - Deployment and routing configuration
- `.vercelignore` - Exclude files from deployment
- `VERCEL_DEPLOYMENT.md` - This deployment guide

**Database:**
- `server/models/` - Mongoose schemas
- `server/config/database.js` - Database connection
- `server/middleware/auth.js` - JWT authentication middleware

## 🎯 Result
Your full-stack Vue.js application will be deployed on Vercel with:
- ✅ Static frontend with SPA routing
- ✅ Serverless API endpoints
- ✅ MongoDB Atlas database connection
- ✅ JWT authentication
- ✅ CORS configuration for cross-origin requests
- ✅ Production-ready environment variables