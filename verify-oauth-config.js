// ============================================
// OAUTH CONFIGURATION VERIFICATION SCRIPT
// ============================================
// Run this to verify all OAuth settings are correct

console.log('🔍 VERIFYING OAUTH CONFIGURATION...\n');

// Check environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'SESSION_SECRET'
];

console.log('📋 Environment Variables Check:');
let envCheckPassed = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NOT SET`);
    envCheckPassed = false;
  } else {
    console.log(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
  }
});

console.log('\n📋 OAuth Configuration:');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${process.env.PORT || 5000}`);
console.log(`Callback URL: ${process.env.GOOGLE_CALLBACK_URL}`);

// Check callback URL format
const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
if (callbackUrl) {
  if (callbackUrl.includes('localhost')) {
    console.log('⚠️ WARNING: Callback URL uses localhost (won\'t work in production)');
  } else if (callbackUrl.startsWith('https://')) {
    console.log('✅ Callback URL uses HTTPS');
  } else {
    console.log('❌ Callback URL should use HTTPS in production');
  }
  
  if (callbackUrl.includes('/api/auth/google/callback')) {
    console.log('✅ Callback URL path is correct');
  } else {
    console.log('❌ Callback URL path should be /api/auth/google/callback');
  }
}

console.log('\n📋 Session Configuration:');
console.log(`Session Secret: ${process.env.SESSION_SECRET ? 'Set ✅' : 'NOT SET ❌'}`);
console.log(`Trust Proxy: Should be set in server.js before middleware`);

console.log('\n📋 Expected Cookie Settings in Production:');
console.log(`  - secure: true (HTTPS only)`);
console.log(`  - httpOnly: true (XSS protection)`);
console.log(`  - sameSite: 'none' (Allow cross-site OAuth)`);
console.log(`  - domain: undefined (Auto-handled)`);

console.log('\n📋 Rate Limiter Configuration:');
console.log(`  - Trust proxy: MUST be set before rate limiter`);
console.log(`  - Order: app.set('trust proxy', 1) → THEN → app.use(rateLimiter)`);

console.log('\n🎯 OAuth Flow Steps:');
console.log('1. User visits: /api/auth/google');
console.log('   → Backend redirects to Google login');
console.log('   → Session created with cookie');
console.log('');
console.log('2. User logs in with Google');
console.log('   → Google redirects to callback URL');
console.log('   → Cookie sent back with request');
console.log('');
console.log('3. Backend receives callback');
console.log('   → Session retrieved from cookie');
console.log('   → Passport verifies with Google');
console.log('   → User authenticated!');
console.log('');
console.log('4. Backend redirects to frontend');
console.log('   → With access_token and refresh_token');

console.log('\n🔧 Troubleshooting Checklist:');
console.log('□ Environment variables set in Render');
console.log('□ Google Console redirect URI matches backend URL');
console.log('□ Trust proxy set BEFORE rate limiter in code');
console.log('□ Session configured with proxy: true');
console.log('□ Cookies use sameSite: "none" in production');
console.log('□ Browser cookies cleared before testing');

console.log('\n📱 Test URLs:');
console.log(`Local: http://localhost:${process.env.PORT || 5000}/api/auth/google`);
console.log(`Production: https://qb-securiegnty-backend.onrender.com/api/auth/google`);

if (envCheckPassed) {
  console.log('\n✅ All environment variables are set!');
  console.log('🚀 OAuth should work if:');
  console.log('   1. Code deployed to Render');
  console.log('   2. Google Console callback URL is correct');
  console.log('   3. Browser cookies are cleared');
} else {
  console.log('\n❌ Some environment variables are missing!');
  console.log('⚠️ OAuth will NOT work until all variables are set.');
}

console.log('\n' + '='.repeat(50));
console.log('🎯 Verification complete!');
console.log('='.repeat(50));
