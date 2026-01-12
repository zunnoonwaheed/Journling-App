# Deployment Guide - AI Journaling App

Complete guide to deploy your AI Journaling App to Vercel with working frontend, backend, database, and API integrations.

## 🚀 Quick Deploy

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Supabase project (already configured)

## Step 1: Push to GitHub

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Configure for Vercel deployment"

# Push to GitHub
git push origin main
```

If this is your first push and you need to authenticate, GitHub will prompt you.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `zunnoonwaheed/Journling-App`
3. Vercel will detect it as a monorepo with frontend and backend

#### Configure Root Directory Projects:

**For Frontend:**
- Framework Preset: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**For Backend (API):**
- Root Directory: `backend`
- This will be treated as serverless functions

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy (run from project root)
vercel

# Follow prompts:
# - Link to existing project or create new
# - Configure settings as shown above
```

## Step 3: Configure Environment Variables in Vercel

### For Backend API (Important!)

Go to your Vercel project → Settings → Environment Variables

**IMPORTANT**: Replace placeholder values with your actual credentials from:
- OpenAI: https://platform.openai.com/api-keys
- Supabase: Your project dashboard → Settings → API

Add these variables:

```env
NODE_ENV=production
PORT=4000

# JWT Secret
JWT_SECRET=1234567890

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPEN_AI_KEY=sk-proj-YOUR_OPENAI_API_KEY_HERE

# RESTDB (optional - if using RestDB sync)
RESTDB_BASE_URL=your_restdb_url
RESTDB_API_KEY=your_restdb_api_key
RESTDB_COLLECTION=journalentries

# Supabase (REQUIRED - get from your Supabase dashboard)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_AUDIO_BUCKET=audio
```

**IMPORTANT:** Set these for all environments:
- ✅ Production
- ✅ Preview
- ✅ Development

### For Frontend (if needed)

```env
VITE_API_URL=https://your-backend-url.vercel.app
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Update Frontend API URL

After backend is deployed, update your frontend code to use the Vercel backend URL:

1. Find your backend URL: `https://your-project-name.vercel.app`
2. Update frontend API calls to use this URL (or use environment variable)

## Step 5: Verify Deployment

### Test Backend API:

```bash
# Test health check
curl https://your-backend-url.vercel.app/api/journal-ease/auth/test

# Should return:
# {"status":"fail","message":"No token provided"}
```

### Test Frontend:

Visit your frontend URL: `https://your-project-name.vercel.app`

### Test Database Connection:

The backend should automatically connect to Supabase. Check Vercel logs:
- Go to your project → Deployments → Latest deployment → Logs
- Look for: "✅ Database connected successfully via Supabase client"

## Architecture on Vercel

```
Frontend (Static Site - Vite)
  ↓
Backend API (Serverless Functions - Node.js)
  ↓
Supabase (PostgreSQL + Storage)
  ↓
OpenAI API (Transcription)
```

## Important Notes

### 1. Supabase Connection
- ✅ Your backend uses Supabase JS client (works on Vercel)
- ✅ No direct PostgreSQL connection needed
- ✅ `exec_sql` function is already created in Supabase

### 2. CORS Configuration
Your backend is already configured to accept requests from Vercel domains:
```javascript
// In backend/app.js
const allowedOrigins = [
  'https://ai-journaling-app-main.vercel.app',
  'http://localhost:5173',
];
// Plus all *.vercel.app domains
```

**Update this** to include your actual Vercel frontend URL after deployment.

### 3. File Uploads
- Audio files are stored in Supabase Storage bucket: `audio`
- Bucket must be configured in Supabase dashboard

### 4. Serverless Function Limits (Vercel Free Tier)
- Max execution time: 10 seconds
- Max payload size: 5MB
- If you need more, upgrade to Vercel Pro

## Troubleshooting

### Backend API not responding:
1. Check Vercel logs for errors
2. Verify environment variables are set correctly
3. Make sure Supabase project is active

### Database queries failing:
1. Verify `exec_sql` function exists in Supabase (see backend/SETUP.md)
2. Check SUPABASE_SERVICE_ROLE_KEY is correct
3. Look for errors in Vercel function logs

### CORS errors:
1. Update allowed origins in `backend/app.js`
2. Add your Vercel frontend URL to the allowedOrigins array
3. Redeploy backend

### Frontend can't reach backend:
1. Update VITE_API_URL in frontend environment variables
2. Make sure it points to your Vercel backend URL
3. Rebuild and redeploy frontend

## Post-Deployment Checklist

- [ ] Backend deployed and responding
- [ ] Frontend deployed and loading
- [ ] Can create account (signup works)
- [ ] Can login
- [ ] Can create journal entries
- [ ] Audio upload and transcription works
- [ ] All environment variables configured
- [ ] CORS is working (no browser errors)

## Updating After Deployment

```bash
# Make changes locally
# Test locally: npm run dev

# Commit and push
git add .
git commit -m "Your update message"
git push origin main

# Vercel will auto-deploy on push to main branch
```

## Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update CORS origins to include your custom domain

## Monitoring

- **Vercel Dashboard**: Monitor deployments, logs, and analytics
- **Supabase Dashboard**: Monitor database queries and storage
- **OpenAI Dashboard**: Monitor API usage and costs

## Support

If deployment fails:
1. Check Vercel deployment logs
2. Verify all environment variables
3. Test backend locally first: `cd backend && npm run dev`
4. Test frontend locally: `cd frontend && npm run dev`

---

## Quick Reference

### Your Project URLs (after deployment):
- **GitHub**: https://github.com/zunnoonwaheed/Journling-App
- **Frontend**: Will be `https://journling-app.vercel.app` (or similar)
- **Backend API**: Will be `https://journling-app-api.vercel.app` (or similar)
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard

### Current Configuration:
- ✅ Supabase project: kdttmphelrwdmlnjisat
- ✅ Database: Connected via Supabase JS client
- ✅ Storage: Supabase bucket `audio`
- ✅ API: OpenAI for transcription
- ✅ Auth: JWT + bcrypt

🎉 Your app is ready to deploy!
