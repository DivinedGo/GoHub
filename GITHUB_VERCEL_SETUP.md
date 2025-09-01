# 🚀 GitHub + Vercel Deployment Guide

## Your MongoDB Credentials
- **Username**: `nightsnare19_db_user`
- **Password**: `otVhOavfMfnqJeNt`
- **Connection String**: `mongodb+srv://nightsnare19_db_user:otVhOavfMfnqJeNt@cluster0.xxxxx.mongodb.net/gopuzzles?retryWrites=true&w=majority`

## Step 1: GitHub Authentication & Repository Setup

### 1.1 Logout and Re-login to GitHub
```bash
# Check current GitHub user
git config --global user.name
git config --global user.email

# Clear GitHub credentials (if needed)
git config --global --unset user.name
git config --global --unset user.email
git config --global --unset credential.helper

# Set your GitHub credentials
git config --global user.name "Your GitHub Username"
git config --global user.email "your-email@example.com"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com
2. Click **"New repository"**
3. Repository name: `go-puzzle-website` (or your preferred name)
4. Make it **Public** (required for free Vercel)
5. **Do NOT** initialize with README (you already have files)
6. Click **"Create repository"**

### 1.3 Connect Local Project to GitHub
```bash
# Navigate to your project folder
cd "C:\Users\Curtis\Documents\puzzles"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Go Puzzle Website with MongoDB"

# Add remote repository (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/go-puzzle-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Vercel Deployment

### 2.1 Connect GitHub to Vercel
1. Go to https://vercel.com
2. Click **"Sign up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### 2.2 Import Your Project
1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your `go-puzzle-website` repository
3. Click **"Import"**

### 2.3 Configure Project Settings
- **Framework Preset**: Other
- **Root Directory**: `./` (leave default)
- **Build Command**: Leave empty
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### 2.4 Set Environment Variables
Before deploying, click **"Environment Variables"** and add:

| Variable Name | Value |
|---------------|--------|
| `MONGODB_URI` | `mongodb+srv://nightsnare19_db_user:otVhOavfMfnqJeNt@cluster0.xxxxx.mongodb.net/gopuzzles?retryWrites=true&w=majority` |
| `ADMIN_KEY` | `admin123` |
| `NODE_ENV` | `production` |

**Important**: Replace `cluster0.xxxxx` with your actual MongoDB cluster URL from Atlas.

### 2.5 Deploy
1. Click **"Deploy"**
2. Wait for deployment to complete
3. You'll get a URL like: `https://go-puzzle-website.vercel.app`

## Step 3: Test Your Deployment

### 3.1 Test Website
- Visit your Vercel URL
- Test puzzle loading and gameplay
- Check browser console for errors

### 3.2 Test Admin Interface
- Go to `https://your-app.vercel.app/puzzlesadmin27988794`
- Create a test collection
- Create a test puzzle

## Step 4: Automatic Deployments

Once connected, every push to your `main` branch will automatically trigger a new deployment:

```bash
# Make changes to your code
git add .
git commit -m "Update: description of changes"
git push origin main
# Vercel will automatically redeploy
```

## Troubleshooting

### If Git Authentication Fails:
1. **Generate Personal Access Token**:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope
   - Use token as password when pushing

2. **Alternative: Use GitHub CLI**:
   ```bash
   # Install GitHub CLI
   winget install GitHub.cli
   
   # Authenticate
   gh auth login
   ```

### If MongoDB Connection Fails:
1. Check Network Access in MongoDB Atlas allows `0.0.0.0/0`
2. Verify username/password are correct
3. Ensure database user has read/write permissions

## Your Complete MongoDB Connection String

```
mongodb+srv://nightsnare19_db_user:otVhOavfMfnqJeNt@cluster0.xxxxx.mongodb.net/gopuzzles?retryWrites=true&w=majority
```

**Remember to replace `cluster0.xxxxx` with your actual cluster URL from MongoDB Atlas!**

## Quick Command Summary

```bash
# 1. Setup Git
cd "C:\Users\Curtis\Documents\puzzles"
git init
git add .
git commit -m "Initial commit: Go Puzzle Website"

# 2. Connect to GitHub (replace URL with yours)
git remote add origin https://github.com/YOUR_USERNAME/go-puzzle-website.git
git push -u origin main

# 3. Go to Vercel.com and import your GitHub repository
# 4. Set environment variables in Vercel dashboard
# 5. Deploy!
```
