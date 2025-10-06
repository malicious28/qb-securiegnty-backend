# 🔐 Google OAuth Configuration Guide

## 📋 **IMPORTANT: Security Notice**

**DO NOT commit real secrets to GitHub!** This guide uses placeholders. Get your actual values from:
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Render Dashboard:** Your actual deployment platform
- **Vercel Dashboard:** Your frontend deployment

---

## 🎯 **Step 1: Google Cloud Console Setup**

### Create OAuth 2.0 Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "QB Securiegnty OAuth"

### Configure Authorized URLs

**Authorized JavaScript origins:**
```
https://qbsecuriegnty.com
https://www.qbsecuriegnty.com
https://qb-securiegnty-backend.onrender.com
```

**Authorized redirect URIs:**
```
https://qb-securiegnty-backend.onrender.com/api/auth/google/callback
```

⚠️ **ONLY add backend callback URL here!** Frontend URLs go in JavaScript origins only.

---

## 🔧 **Step 2: Render Environment Variables (Backend)**

In Render Dashboard → Your Service → Environment, add:

```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Google OAuth (GET FROM GOOGLE CONSOLE)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://qb-securiegnty-backend.onrender.com/api/auth/google/callback

# Session & JWT (GENERATE SECURE RANDOM STRINGS)
SESSION_SECRET_VALUE=your-secure-random-string-min-64-chars
JWT_SECRET=your-jwt-secret-key

# Database (GET FROM NEON/YOUR DB PROVIDER)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Email (GET FROM GMAIL APP PASSWORDS)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Frontend
FRONTEND_URL=https://qbsecuriegnty.com
```

### How to generate secure secrets:

**PowerShell:**
```powershell
# Generate session secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Node.js:**
```javascript
require('crypto').randomBytes(64).toString('hex')
```

**Online:** https://www.random.org/strings/

---

## 🌐 **Step 3: Vercel Environment Variables (Frontend)**

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```env
VITE_BACKEND_URL=https://qb-securiegnty-backend.onrender.com
VITE_API_URL=https://qb-securiegnty-backend.onrender.com
VITE_API_BASE_URL=https://qb-securiegnty-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

⚠️ **Note:** Use the SAME client ID as in Render, just the ID part (not the secret).

---

## 💻 **Step 4: Frontend Code Configuration**

### API Configuration

Create `src/config/api.js`:

```javascript
// Use environment variable for backend URL
export const API_URL = import.meta.env.VITE_BACKEND_URL || 
                       'https://qb-securiegnty-backend.onrender.com';

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
```

### Google Login Button

```javascript
import { API_URL } from './config/api';

function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <button onClick={handleGoogleLogin} className="google-login-btn">
      <img src="/google-icon.svg" alt="Google" />
      Sign in with Google
    </button>
  );
}

export default GoogleLoginButton;
```

### OAuth Success Page

Create `src/pages/SocialLoginSuccess.jsx`:

```javascript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function SocialLoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');

    if (token && refresh) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', refresh);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="oauth-processing">
      <h2>🔐 Processing login...</h2>
      <p>Please wait...</p>
    </div>
  );
}

export default SocialLoginSuccess;
```

Add route:
```javascript
<Route path="/social-login-success" element={<SocialLoginSuccess />} />
```

---

## 🧪 **Step 5: Testing**

### Test Backend

1. Wake up server:
   ```
   https://qb-securiegnty-backend.onrender.com/wake-up
   ```

2. Check health:
   ```
   https://qb-securiegnty-backend.onrender.com/health
   ```

3. Test OAuth (should redirect to Google):
   ```
   https://qb-securiegnty-backend.onrender.com/api/auth/google
   ```

### Test Complete Flow

1. Go to your frontend: `https://qbsecuriegnty.com`
2. Click "Sign in with Google"
3. Log in with Google account
4. Should redirect back with tokens
5. Check localStorage for tokens
6. Should be redirected to dashboard

---

## 🔍 **Troubleshooting**

### Error: redirect_uri_mismatch

**Cause:** Google Console redirect URI doesn't match backend callback URL

**Fix:** 
1. Go to Google Console
2. Ensure redirect URI is EXACTLY: `https://qb-securiegnty-backend.onrender.com/api/auth/google/callback`
3. No trailing slash, correct domain
4. Save and wait 5 minutes

### Error: Connection Refused

**Cause:** Backend server is asleep or wrong URL in frontend

**Fix:**
1. Wake up backend: Visit `/wake-up` endpoint
2. Check frontend uses production backend URL, not localhost

### Error: CORS

**Cause:** Frontend domain not in backend CORS whitelist

**Fix:** Backend already configured for your domains. If issue persists, check Render logs.

---

## 📋 **Checklist**

- [ ] Google OAuth credentials created
- [ ] Authorized URLs configured in Google Console
- [ ] Environment variables set in Render
- [ ] Environment variables set in Vercel
- [ ] Frontend uses production backend URL
- [ ] `/social-login-success` route created
- [ ] Tested OAuth flow end-to-end
- [ ] Tokens stored correctly
- [ ] User redirected to dashboard

---

## 🔒 **Security Best Practices**

1. ✅ Never commit `.env` files
2. ✅ Use environment variables for all secrets
3. ✅ Generate strong random secrets (64+ characters)
4. ✅ Use HTTPS in production
5. ✅ Rotate secrets regularly
6. ✅ Use app-specific passwords for Gmail
7. ✅ Keep Google Client Secret confidential

---

## 📚 **Reference**

- **Google OAuth 2.0 Docs:** https://developers.google.com/identity/protocols/oauth2
- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs

---

**Remember:** This backend code is already configured correctly. Just add your environment variables and it will work! 🚀
