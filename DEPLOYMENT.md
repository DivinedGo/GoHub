# 🚀 Go Puzzle We2. **Get Connection String**:
   - In your cluster, click "Connect"
   - Choose "Connect your application"
   - Your connection string should be:
   ```
   mongodb+srv://nightsnare19_db_user:otVhOavfMfnqJeNt@cluster0.xxxxx.mongodb.net/gopuzzles?retryWrites=true&w=majority
   ```
   - Replace `cluster0.xxxxx` with your actual cluster URL
   - The database name will be `gopuzzles`ercel Deployment Guide

## Overview
This guide walks you through deploying your Go Puzzle website to Vercel with MongoDB Atlas.

## Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (free)

## Step 1: Set up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (choose the free M0 tier)

2. **Get Connection String**
   - In your cluster, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/gopuzzles?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Replace `gopuzzles` with your preferred database name

3. **Whitelist IP Addresses**
   - In Atlas, go to Network Access
   - Add IP Address: `0.0.0.0/0` (allow from anywhere for Vercel)

## Step 2: Prepare GitHub Repository

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Go Puzzle Website"
   ```

2. **Create GitHub Repository**
   - Go to GitHub and create a new repository
   - Don't initialize with README (you already have files)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

1. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   In Vercel dashboard → Settings → Environment Variables, add:
   
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `ADMIN_KEY`: A secure random string (e.g., `admin_super_secret_key_2025`)
   - `NODE_ENV`: `production`

3. **Deploy**
   - Vercel will automatically deploy from your GitHub repo
   - Every push to main branch will trigger a new deployment

## Step 4: Test Your Deployment

After deployment, test these URLs:

- Main site: `https://your-app.vercel.app/puzzles`
- Admin panel: `https://your-app.vercel.app/puzzlesadmin27988794`
- API health: `https://your-app.vercel.app/api/collections`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/gopuzzles` |
| `ADMIN_KEY` | Secret key for admin access | `admin_super_secret_key_2025` |
| `NODE_ENV` | Environment mode | `production` |

## File Structure
```
your-project/
├── frontend/              # Static frontend files
│   ├── puzzles.html      # Main puzzle interface
│   ├── puzzle.html       # Individual puzzle view
│   ├── puzzlesadmin27988794.html  # Admin collections
│   ├── puzzlesadmincreate27988794.html  # Admin create puzzle
│   └── styles.css        # Enhanced CSS styling
├── backend/              # Node.js/Express API
│   ├── server.js         # Main server file
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API route handlers
│   └── package.json      # Backend dependencies
├── vercel.json           # Vercel configuration
├── package.json          # Root package.json
└── README.md            # This file
```

## API Endpoints

### Collections
- `GET /api/collections` - List all collections
- `POST /api/collections` - Create new collection (admin)
- `GET /api/collections/:id` - Get specific collection

### Puzzles
- `GET /api/puzzles` - List puzzles
- `POST /api/puzzles` - Create puzzle (admin)
- `GET /api/puzzles/:id` - Get specific puzzle
- `POST /api/puzzles/:id/attempt` - Record attempt
- `POST /api/puzzles/:id/complete` - Record completion

### Admin
- `GET /api/admin/collections` - Admin collection management
- `POST /api/admin/collections` - Create/edit collections

## Security Features
- Rate limiting (100 requests per 15 minutes per IP)
- Helmet.js security headers
- CORS protection
- Admin key authentication
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB Atlas connection string
   - Verify network access (0.0.0.0/0 whitelisted)
   - Ensure username/password are correct

2. **Environment Variables Not Loading**
   - Check Vercel dashboard → Settings → Environment Variables
   - Redeploy after adding variables

3. **404 Errors on Routes**
   - Check vercel.json routing configuration
   - Ensure file paths match in frontend/

4. **Admin Access Denied**
   - Verify ADMIN_KEY environment variable
   - Check browser console for errors

### Development vs Production

**Local Development:**
```bash
cd backend
npm install
npm run dev
```

**Production (Vercel):**
- Automatic deployment from GitHub
- Serverless functions for API
- Global CDN for frontend assets

## Performance Optimization

The deployed site includes:
- Compression middleware
- Static asset caching
- MongoDB connection pooling
- Rate limiting
- Optimized CSS with modern features

## Monitoring

Monitor your deployment:
- Vercel Dashboard: Real-time logs and analytics
- MongoDB Atlas: Database metrics
- Browser DevTools: Frontend performance

## Support

For issues:
1. Check Vercel deployment logs
2. Verify MongoDB Atlas connectivity
3. Review browser console errors
4. Check environment variables

## Next Steps

After successful deployment:
1. Create your first puzzle collection via admin panel
2. Add sample puzzles to test functionality
3. Share the admin URL (`/puzzlesadmin27988794`) with trusted users
4. Monitor usage through Vercel analytics

---

🎉 **Congratulations!** Your Go Puzzle website is now live on Vercel with MongoDB Atlas!
