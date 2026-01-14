# 🔧 FIX GOOGLE OAUTH REDIRECT (2 Minutes)

## 🚨 THE PROBLEM:

Google login redirects to `http://localhost:3000` instead of your deployed app!

**Why?** The Site URL in Supabase is set to localhost.

---

## ✅ SOLUTION: Update Supabase Site URL

### Step 1: Go to Supabase Dashboard

**Visit**: https://supabase.com/dashboard

### Step 2: Select Your Project

Click on project: **kdttmphelrwdmlnjisat**

### Step 3: Fix URL Configuration

1. Click **Authentication** (left sidebar)
2. Click **URL Configuration**
3. **Update these settings:**

**Site URL** - Change from localhost to:
```
https://frontend-mu-wheat-65.vercel.app
```

**Redirect URLs** - Click "+ Add URL" and add:
```
https://frontend-mu-wheat-65.vercel.app/**
https://frontend-mu-wheat-65.vercel.app/me
https://frontend-mu-wheat-65.vercel.app/auth/callback
```

**Remove these** (if present):
```
http://localhost:3000
http://localhost:5173
```

4. Click **Save**

### Step 4: Update Google Console (If Needed)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth client
3. **Authorized redirect URIs** - Make sure you have:
```
https://kdttmphelrwdmlnjisat.supabase.co/auth/v1/callback
https://frontend-mu-wheat-65.vercel.app
https://frontend-mu-wheat-65.vercel.app/me
```

4. Click **Save**

---

## ✅ DONE! Google OAuth Will Now Work!

After this fix:
1. Go to: **https://frontend-mu-wheat-65.vercel.app** (NOT localhost!)
2. Click "Sign in with Google"
3. It will redirect to the deployed app ✅

---

## 🎯 Quick Summary:

**Before:**
- Site URL: `http://localhost:3000` ❌
- Redirect: Goes to localhost ❌

**After:**
- Site URL: `https://frontend-mu-wheat-65.vercel.app` ✅
- Redirect: Goes to deployed app ✅

---

**This takes 2 minutes! Do it now!** 🚀
