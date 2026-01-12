# Vercel Deployment Checklist ✅

Your code is now on GitHub! Follow these steps to deploy to Vercel.

## 📦 What's Been Pushed to GitHub

✅ Complete frontend (React + Vite)
✅ Complete backend (Express + Supabase)
✅ Vercel configuration files
✅ Database setup scripts
✅ Comprehensive documentation

## 🚀 Deploy to Vercel - Step by Step

### Step 1: Go to Vercel
1. Visit https://vercel.com/new
2. Sign in with your GitHub account
3. Click "Import Project"

### Step 2: Import from GitHub
1. Find your repository: **zunnoonwaheed/Journling-App**
2. Click "Import"
3. Vercel will detect it as a monorepo

### Step 3: Configure Project Settings

#### Option A: Deploy as Monorepo (Recommended)
Vercel will automatically detect both frontend and backend.

**For Frontend:**
- Framework: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**For Backend:**
- Root Directory: `backend`
- Output: Serverless Functions
- Entry Point: `server.js`

#### Option B: Deploy Separately
1. **First deployment** - Deploy frontend only
   - Root Directory: `frontend`
   - Framework: Vite

2. **Second deployment** - Deploy backend as API
   - Root Directory: `backend`
   - Type: Node.js serverless functions

### Step 4: Configure Environment Variables ⚠️ CRITICAL

Go to: Project Settings → Environment Variables

Copy these variables and **replace with your actual values**:

```env
# Backend Environment Variables (Production, Preview, Development)

NODE_ENV=production
PORT=4000
JWT_SECRET=1234567890

# OpenAI - Get from: https://platform.openai.com/api-keys
OPEN_AI_KEY=YOUR_ACTUAL_OPENAI_KEY

# RESTDB (Optional - only if using RestDB sync)
RESTDB_BASE_URL=YOUR_RESTDB_URL
RESTDB_API_KEY=YOUR_RESTDB_KEY
RESTDB_COLLECTION=journalentries

# Supabase - Get from: Your Supabase Dashboard → Settings → API
DATABASE_URL=YOUR_SUPABASE_DATABASE_URL
SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_AUDIO_BUCKET=audio
```

**Where to find your keys:**

1. **OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create new key or use existing
   - Copy: `sk-proj-...`

2. **Supabase Credentials**
   - Go to https://supabase.com/dashboard
   - Select your project: kdttmphelrwdmlnjisat
   - Go to Settings → API
   - Copy:
     - `SUPABASE_URL` (Project URL)
     - `SUPABASE_ANON_KEY` (anon public)
     - `SUPABASE_SERVICE_ROLE_KEY` (service_role secret)

3. **Database URL**
   - In Supabase → Settings → Database → Connection String
   - Copy the URI format

### Step 5: Deploy!

Click **"Deploy"** button

Vercel will:
1. Install dependencies
2. Build your project
3. Deploy to production
4. Give you a URL: `https://your-project.vercel.app`

### Step 6: Verify Deployment

#### Test Backend API:
```bash
curl https://your-backend-url.vercel.app/api/journal-ease/auth/test
```

Expected response:
```json
{"status":"fail","message":"No token provided"}
```

#### Test Frontend:
Visit: `https://your-frontend-url.vercel.app`

### Step 7: Update CORS (If Needed)

If you get CORS errors:

1. Edit `backend/app.js`
2. Add your Vercel URL to `allowedOrigins`:
   ```javascript
   const allowedOrigins = [
     'https://your-actual-vercel-url.vercel.app',
     'http://localhost:5173',
   ];
   ```
3. Commit and push:
   ```bash
   git add backend/app.js
   git commit -m "Update CORS for Vercel deployment"
   git push origin main
   ```
4. Vercel will auto-redeploy

### Step 8: Update Frontend API URL

If frontend and backend are separate deployments:

1. In Vercel → Frontend Project → Settings → Environment Variables
2. Add:
   ```env
   VITE_API_URL=https://your-backend-url.vercel.app
   ```
3. Redeploy frontend

## 🎯 Quick Links After Deployment

- **Your Code**: https://github.com/zunnoonwaheed/Journling-App
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **OpenAI API Keys**: https://platform.openai.com/api-keys

## ✅ Post-Deployment Checklist

Test these features:
- [ ] Frontend loads
- [ ] Backend API responds
- [ ] User signup works
- [ ] User login works
- [ ] Create journal entry
- [ ] Upload audio
- [ ] Transcription works
- [ ] View entries
- [ ] Edit entries
- [ ] Delete entries

## 🔧 Troubleshooting

### "Module not found" error
- Check that all dependencies are in `package.json`
- Verify `node_modules` is in `.gitignore`

### "Database connection failed"
- Verify `exec_sql` function exists in Supabase (see backend/SETUP.md)
- Check environment variables are set correctly
- Look at Vercel function logs

### "CORS error" in browser
- Update `backend/app.js` with your Vercel URL
- Redeploy backend

### "OpenAI API error"
- Verify API key is correct
- Check OpenAI account has credits
- Look at Vercel function logs for detailed error

## 📚 Full Documentation

- **Deployment Guide**: DEPLOYMENT.md
- **Backend Setup**: backend/SETUP.md
- **Project README**: README.md

---

## Need Help?

1. Check Vercel deployment logs
2. Check Supabase dashboard for database issues
3. Review error messages in browser console
4. See troubleshooting section in DEPLOYMENT.md

Good luck with your deployment! 🚀
