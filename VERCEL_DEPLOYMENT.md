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
- `NODE_ENV=production`
- Any other environment variables needed

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

### 7. Verification
After deployment:
- ✅ Build completes successfully
- ✅ Static files served correctly
- ✅ Vue.js app loads
- ✅ Routing works for SPA

## 📁 Key Files
- `index.html` - Entry point (moved to root)
- `vite.config.js` - Build configuration
- `vercel.json` - Deployment configuration
- `.vercelignore` - Exclude files
- `package.json` - Build scripts

## 🎯 Result
Your Vue.js application will be deployed as a static site on Vercel with proper SPA routing support.