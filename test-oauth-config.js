/**
 * GOOGLE OAUTH TESTING SCRIPT
 * Run this to verify your Google OAuth configuration
 */

require('dotenv').config();

console.log('\n🔐 GOOGLE OAUTH CONFIGURATION CHECK\n');
console.log('=' .repeat(60));

const checks = {
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'GOOGLE_CALLBACK_URL': process.env.GOOGLE_CALLBACK_URL,
  'SESSION_SECRET_VALUE': process.env.SESSION_SECRET_VALUE,
  'SESSION_SECRET': process.env.SESSION_SECRET,
  'JWT_SECRET': process.env.JWT_SECRET,
  'FRONTEND_URL': process.env.FRONTEND_URL,
  'DATABASE_URL': process.env.DATABASE_URL,
  'NODE_ENV': process.env.NODE_ENV || 'development',
  'PORT': process.env.PORT || '5000'
};

let allPassed = true;

for (const [key, value] of Object.entries(checks)) {
  const status = value ? '✅' : '❌';
  const display = value 
    ? (key.includes('SECRET') || key.includes('DATABASE') 
        ? value.substring(0, 20) + '...' 
        : value)
    : 'NOT SET';
  
  console.log(`${status} ${key.padEnd(25)} ${display}`);
  
  if (!value && !['NODE_ENV', 'PORT'].includes(key)) {
    allPassed = false;
  }
}

console.log('=' .repeat(60));

// Check callback URL construction
const PORT = process.env.PORT || 5000;
const expectedCallbackDev = `http://localhost:${PORT}/api/auth/google/callback`;
const expectedCallbackProd = 'https://qb-securiegnty-backend.onrender.com/api/auth/google/callback';
const expectedCallback = process.env.NODE_ENV === 'production' 
  ? expectedCallbackProd 
  : expectedCallbackDev;

console.log('\n📍 CALLBACK URL ANALYSIS:');
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Expected: ${expectedCallback}`);
console.log(`   Configured: ${process.env.GOOGLE_CALLBACK_URL || 'NOT SET (will use default)'}`);

if (process.env.GOOGLE_CALLBACK_URL === expectedCallback) {
  console.log('   ✅ Callback URL matches expected value');
} else if (!process.env.GOOGLE_CALLBACK_URL) {
  console.log('   ⚠️  Using default callback URL (this is OK)');
} else {
  console.log('   ⚠️  Callback URL differs from expected');
}

// Frontend URL check
console.log('\n🌐 FRONTEND CONFIGURATION:');
console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
console.log(`   Expected redirect: ${process.env.FRONTEND_URL || 'NOT SET'}/social-login-success`);

// Session secret check
console.log('\n🔒 SESSION CONFIGURATION:');
const sessionSecret = process.env.SESSION_SECRET_VALUE || process.env.SESSION_SECRET;
if (sessionSecret) {
  console.log('   ✅ Session secret is configured');
  console.log(`   Length: ${sessionSecret.length} characters`);
  if (sessionSecret.length < 32) {
    console.log('   ⚠️  Session secret is short (recommended: 64+ characters)');
  }
} else {
  console.log('   ❌ Session secret is NOT configured');
  allPassed = false;
}

// Final summary
console.log('\n' + '=' .repeat(60));
if (allPassed) {
  console.log('✅ ALL CHECKS PASSED - Configuration looks good!');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Verify in Google Cloud Console:');
  console.log(`   - Authorized redirect URI: ${expectedCallback}`);
  console.log('2. Deploy to Render with these environment variables');
  console.log('3. Test OAuth flow: Visit /api/auth/google');
} else {
  console.log('❌ SOME CHECKS FAILED - Please fix the configuration');
  console.log('\n📋 TODO:');
  console.log('1. Add missing environment variables');
  console.log('2. See GOOGLE_OAUTH_SETUP.md for detailed instructions');
}
console.log('=' .repeat(60) + '\n');

// Test Google OAuth endpoints (if server is running)
async function testEndpoints() {
  console.log('\n🧪 TESTING ENDPOINTS (if server is running)...\n');
  
  const axios = require('axios');
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://qb-securiegnty-backend.onrender.com'
    : `http://localhost:${PORT}`;
  
  const tests = [
    { name: 'Health Check', url: `${baseUrl}/health` },
    { name: 'Auth Status', url: `${baseUrl}/api/auth/security-status` },
  ];
  
  for (const test of tests) {
    try {
      const response = await axios.get(test.url, { timeout: 5000 });
      console.log(`✅ ${test.name}: OK (${response.status})`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`⚠️  ${test.name}: Server not running`);
      } else {
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }
}

// Only test endpoints if axios is available
try {
  testEndpoints();
} catch (error) {
  console.log('\n⚠️  Skipping endpoint tests (axios not available or server not running)');
}
