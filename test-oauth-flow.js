#!/usr/bin/env node

/**
 * COMPLETE OAUTH FLOW TESTER
 * Tests Google OAuth configuration and flow
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'https://qb-securiegnty-backend.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://qbsecuriegnty.com';

console.log('\n🧪 GOOGLE OAUTH FLOW TESTER\n');
console.log('=' .repeat(70));
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Frontend URL: ${FRONTEND_URL}`);
console.log('=' .repeat(70) + '\n');

const tests = [
  {
    name: 'Wake Up Backend',
    url: `${BACKEND_URL}/wake-up`,
    expected: 200,
    description: 'Waking up the Render server (free tier may be sleeping)'
  },
  {
    name: 'Health Check',
    url: `${BACKEND_URL}/health`,
    expected: 200,
    description: 'Checking if backend is healthy'
  },
  {
    name: 'API Status',
    url: `${BACKEND_URL}/api/status`,
    expected: 200,
    description: 'Checking API status'
  },
  {
    name: 'Auth Security Status',
    url: `${BACKEND_URL}/api/auth/security-status`,
    expected: 200,
    description: 'Checking authentication system'
  },
  {
    name: 'Google OAuth Initiation',
    url: `${BACKEND_URL}/api/auth/google`,
    expected: 302,
    description: 'Testing OAuth initiation (should redirect to Google)'
  }
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'OAuth-Tester/1.0'
      }
    };
    
    const req = protocol.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    process.stdout.write(`Testing: ${test.name}...`.padEnd(50));
    
    try {
      const response = await makeRequest(test.url);
      
      if (response.statusCode === test.expected) {
        console.log('✅ PASS');
        passed++;
        
        // Show additional info for some tests
        if (test.name === 'Google OAuth Initiation' && response.headers.location) {
          console.log(`   → Redirects to: ${response.headers.location}`);
          if (response.headers.location.includes('accounts.google.com')) {
            console.log('   ✅ Correctly redirects to Google OAuth');
          } else {
            console.log('   ⚠️  Redirect doesn\'t go to Google OAuth');
          }
        }
        
        if (test.name === 'Health Check') {
          try {
            const health = JSON.parse(response.body);
            console.log(`   → Status: ${health.status}`);
            console.log(`   → Uptime: ${health.uptime}s`);
          } catch (e) {
            // Ignore parse errors
          }
        }
      } else {
        console.log(`❌ FAIL (Expected ${test.expected}, got ${response.statusCode})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
      
      if (error.code === 'ENOTFOUND') {
        console.log('   → Server not found. Check the URL.');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('   → Connection refused. Server might be down.');
      } else if (error.message === 'Request timeout') {
        console.log('   → Request timed out. Server might be sleeping.');
        console.log('   → Try again in 30 seconds after wake-up call.');
      }
    }
    
    console.log('');
  }
  
  console.log('=' .repeat(70));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  
  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED! Your backend is ready for OAuth.\n');
    console.log('📋 Next Steps:');
    console.log('1. Go to Google Cloud Console');
    console.log('2. Verify authorized redirect URI:');
    console.log(`   ${BACKEND_URL}/api/auth/google/callback`);
    console.log('3. Test OAuth flow in browser:');
    console.log(`   ${BACKEND_URL}/api/auth/google`);
    console.log('4. You should be redirected to Google login');
    console.log('5. After login, you should be redirected to:');
    console.log(`   ${FRONTEND_URL}/social-login-success?token=...&refresh=...`);
  } else {
    console.log('❌ SOME TESTS FAILED\n');
    console.log('💡 Troubleshooting:');
    console.log('1. If server is sleeping, run this script again after 30 seconds');
    console.log('2. Check Render dashboard for deployment status');
    console.log('3. Verify environment variables in Render');
    console.log('4. Check Render logs for errors');
  }
  
  console.log('=' .repeat(70) + '\n');
}

// Configuration check
console.log('🔍 Configuration Check:\n');

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SESSION_SECRET_VALUE',
  'JWT_SECRET',
  'DATABASE_URL',
  'FRONTEND_URL'
];

console.log('Required Environment Variables (in Render):');
requiredEnvVars.forEach(varName => {
  console.log(`   - ${varName}`);
});

console.log('\n📍 Google Cloud Console Settings:');
console.log(`   Authorized redirect URI: ${BACKEND_URL}/api/auth/google/callback`);
console.log(`   Authorized JavaScript origins: ${BACKEND_URL}`);
console.log(`                                  ${FRONTEND_URL}`);

console.log('\n' + '=' .repeat(70) + '\n');

// Run tests
runTests().catch(console.error);
