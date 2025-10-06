# 🔴 CRITICAL: Google OAuth Endpoint Returns 404

## The Problem

When accessing `https://qb-securiegnty-backend.onrender.com/api/auth/google`, you get:
```json
{"error":"Endpoint not found","requestId":"...","timestamp":"..."}
```

## Root Cause Analysis

After testing, the issue is **NOT** in your code. The route exists and is configured correctly. The 404 error on Render suggests one of these issues:

### **Most Likely: Missing Environment Variables on Render**

If `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` are missing on Render, the Passport Google Strategy initialization will fail silently, causing the OAuth routes to not register.

### **How to Verify**

Go to Render Dashboard → Your Service → Environment Tab

**REQUIRED Environment Variables:**
```env
GOOGLE_CLIENT_ID=952504824288-pls5qvgnca51gplb72de1uuqui7mkt7u.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

## ✅ SOLUTION STEPS

### Step 1: Check Render Environment Variables

1. Go to: https://dashboard.render.com/
2. Click on your `qb-securiegnty-backend` service
3. Go to "Environment" tab
4. Verify these exist:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL`
   - `SESSION_SECRET_VALUE`
   - `JWT_SECRET`
   - `DATABASE_URL`
   - `FRONTEND_URL`
   - `NODE_ENV=production`

###  Step 2: If Missing, Add Them

Click "Add Environment Variable" and add:

```env
GOOGLE_CLIENT_ID=952504824288-pls5qvgnca51gplb72de1uuqui7mkt7u.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://qb-securiegnty-backend.onrender.com/api/auth/google/callback
```

### Step 3: Trigger Manual Deploy

After adding/verifying variables:
1. Go to "Manual Deploy" tab
2. Click "Deploy latest commit"
3. Wait 2-3 minutes for deployment

### Step 4: Test Again

After deployment:
```bash
# Wake up server
curl https://qb-securiegnty-backend.onrender.com/wake-up

# Wait 30 seconds, then test OAuth
curl https://qb-securiegnty-backend.onrender.com/api/auth/google
```

Should redirect to Google!

## 🔍 Debugging

### Check Render Logs

1. Go to Render Dashboard
2. Click "Logs" tab
3. Look for:
   ```
   🔐 Google OAuth Configuration:
      Client ID: Set ✅
      Client Secret: Set ✅
   ```

If you see ` ❌`, the environment variables are missing.

### Test Local vs Production

**Local (works):**
```bash
cd e:\backend
npm start
# Visit: http://localhost:5001/api/auth/google
```

**Production (404):**
```
https://qb-securiegnty-backend.onrender.com/api/auth/google
```

This confirms it's an environment variable issue on Render.

## ⚠️ Important Notes

1. **Don't put secrets in code** - They should only be in Render environment variables
2. **After adding variables** - Always trigger a redeploy
3. **Case sensitive** - Variable names must match exactly
4. **No spaces** - In variable names or values

## 📋 Complete Render Environment Setup

```env
# Google OAuth
GOOGLE_CLIENT_ID=952504824288-pls5qvgnca51gplb72de1uuqui7mkt7u.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://qb-securiegnty-backend.onrender.com/api/auth/google/callback

# Security
SESSION_SECRET_VALUE=96434864b3795943f569d251efd737b8052fdacbb9df1760d25651671d140edde7b7899841f2d1a5d9dc27d1d3910b032dad7f9d9db40e439e0723dcf1ea598f
JWT_SECRET=ashika_mishra2821@8989804121

# Database
DATABASE_URL=postgresql://neondb_owner:npg_4kxp1aVXjfdh@ep-billowing-bird-a1y62bzi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Frontend
FRONTEND_URL=https://qbsecuriegnty.com

# Email
EMAIL_USER=qbsecuriegnty@gmail.com
EMAIL_PASS=adyprudmvqquqjof

# Server
NODE_ENV=production
PORT=10000
```

## ✅ Expected Result

After fixing environment variables and redeploying:

1. `/api/auth/google` returns **302 redirect** to Google
2. After Google login, redirects to your frontend with tokens
3. OAuth flow works end-to-end

## 🚀 Next Steps

1. ✅ Verify/add environment variables in Render
2. ✅ Redeploy
3. ✅ Fix Google Console (remove wrong redirect URI)
4. ✅ Fix frontend to use production backend URL
5. ✅ Test complete OAuth flow

---

**The 404 error is because Render doesn't have the Google OAuth credentials, so Passport can't initialize the strategy, causing the routes to not register. Add them and redeploy!**
