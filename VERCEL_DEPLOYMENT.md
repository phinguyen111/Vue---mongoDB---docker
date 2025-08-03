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

### 3. Quick Deployment Steps

1. **Generate JWT Secret:**
   ```bash
   node generate-jwt-secret.js
   ```
   Copy the generated secret for step 2.

2. **Set Environment Variables on Vercel Dashboard:**
   - Go to https://vercel.com/dashboard
   - Select your project (or import from GitHub if first time)
   - Go to Settings → Environment Variables
   - Add the three required variables (see detailed instructions below)

3. **Deploy to Vercel:**
   ```bash
   # First time deployment
   vercel --prod
   
   # Or if already linked
   vercel deploy --prod
   ```

4. **Verify Environment Variables (Optional):**
   After deployment, test the environment variables:
   ```
   https://your-app.vercel.app/api/test
   ```
   Should return `"status": "OK"` if all variables are set correctly.

5. **Remove Test Endpoint (Recommended):**
   After confirming everything works, delete `api/test.js` for security.

### 4. Alternative Deployment Methods

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

### 5. Build Commands
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
1. Go to your project dashboard on Vercel (https://vercel.com/dashboard)
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add each variable one by one:

   **First Variable:**
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://username:password@cluster.mongodb.net/nheii?retryWrites=true&w=majority`
   - Environment: Production, Preview, Development (check all)
   - Click "Save"
   
   **Second Variable:**
   - Name: `JWT_SECRET`
   - Value: A secure random string (generate using the script below)
   - Environment: Production, Preview, Development (check all)
   - Click "Save"
   
   **Third Variable:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Environment: Production only
   - Click "Save"

**Important Notes:**
- Replace `username`, `password`, and `cluster` in MONGODB_URI with your actual MongoDB Atlas credentials
- Generate a strong JWT_SECRET using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Never commit these values to your repository

### 6. Troubleshooting

#### Environment Variables Issues
**Error: "Environment Variable 'MONGODB_URI' references Secret 'mongodb_uri', which does not exist."**

This error occurs when:
1. Environment variables are not set in Vercel dashboard
2. Variable names don't match exactly
3. Variables are set for wrong environment

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure these variables exist with exact names:
   - `MONGODB_URI`
   - `JWT_SECRET` 
   - `NODE_ENV`
3. Make sure they're enabled for the correct environments
4. Redeploy after adding variables

**To verify variables are set:**
```bash
# Check via Vercel CLI
vercel env ls

# Or add a test endpoint to check (temporary)
# In api/test.js:
export default function handler(req, res) {
  res.json({
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV
  });
}
```

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