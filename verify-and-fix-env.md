# Quick Fix Guide - Google OAuth & Transcription

## Issue 1: Google OAuth Redirects to Localhost

### Fix in Supabase Dashboard (2 minutes):

1. **Go to**: https://supabase.com/dashboard/project/kdttmphelrwdmlnjisat/auth/url-configuration

2. **Update Site URL** to:
   ```
   https://frontend-mu-wheat-65.vercel.app
   ```

3. **Add Redirect URLs** (click "+ Add URL" for each):
   ```
   https://frontend-mu-wheat-65.vercel.app/**
   https://frontend-mu-wheat-65.vercel.app/me
   https://frontend-mu-wheat-65.vercel.app/auth/callback
   ```

4. **Remove** these if present:
   ```
   http://localhost:3000
   http://localhost:5173
   ```

5. Click **SAVE**

### Update Google Cloud Console (2 minutes):

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, ensure you have:
   ```
   https://kdttmphelrwdmlnjisat.supabase.co/auth/v1/callback
   ```
4. Click **SAVE**

---

## Issue 2: Transcription Not Working

### The Problem:
Your OpenAI API key needs to be set in Vercel's environment variables. Local `.env` files don't get deployed!

### Fix via Vercel Dashboard (3 minutes):

1. **Backend Environment Variables**:
   - Go to: https://vercel.com/zunnoonwaheed-gmailcoms-projects/backend/settings/environment-variables
   - Add these variables:

   | Name | Value |
   |------|-------|
   | `OPEN_AI_KEY` | `YOUR_OPENAI_API_KEY_FROM_backend/.env` |
   | `SUPABASE_URL` | `https://kdttmphelrwdmlnjisat.supabase.co` |
   | `SUPABASE_ANON_KEY` | `sb_publishable_7gMMOFSJ160lP4TQvcY6vg_VdQrEPBB` |
   | `SUPABASE_SERVICE_ROLE_KEY` | (from backend/.env line 21) |
   | `SUPABASE_AUDIO_BUCKET` | `audio` |
   | `NODE_ENV` | `production` |

2. **After adding variables**, redeploy:
   - Click **Deployments** tab
   - Click the **...** menu on latest deployment
   - Click **Redeploy**

### Alternative: Fix via CLI

```bash
cd /Users/mac/ai-journaling-app/backend

# Set environment variables
vercel env add OPEN_AI_KEY
# Paste: YOUR_OPENAI_API_KEY_FROM_backend/.env
# Select: Production

vercel env add SUPABASE_URL
# Paste: https://kdttmphelrwdmlnjisat.supabase.co

vercel env add SUPABASE_ANON_KEY
# Paste: sb_publishable_7gMMOFSJ160lP4TQvcY6vg_VdQrEPBB

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste the key from backend/.env

vercel env add SUPABASE_AUDIO_BUCKET
# Paste: audio

vercel env add NODE_ENV
# Paste: production

# Redeploy
vercel --prod
```

---

## Testing After Fixes:

### Test Google OAuth:
1. Go to: **https://frontend-mu-wheat-65.vercel.app** (NOT localhost!)
2. Click "Sign in with Google"
3. Should redirect back to deployed app ✅

### Test Transcription:
1. Go to: **https://frontend-mu-wheat-65.vercel.app**
2. Sign in (email or Google)
3. Click Record button
4. Speak: "Testing audio transcription"
5. Stop recording
6. Should see transcribed text appear ✅

---

## Important Notes:

1. **Stop testing on localhost** - it won't have the proper environment variables
2. **Always use**: `https://frontend-mu-wheat-65.vercel.app`
3. If transcription still fails, check:
   - OpenAI API key has credits: https://platform.openai.com/account/usage
   - API key is valid: https://platform.openai.com/api-keys

---

## Current Status:

- Frontend URL: https://frontend-mu-wheat-65.vercel.app
- Backend URL: https://backend-ten-chi-98.vercel.app
- Supabase URL: https://kdttmphelrwdmlnjisat.supabase.co

All systems should work after these fixes!
