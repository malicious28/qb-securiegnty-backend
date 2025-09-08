const https = require('https');

console.log('🔧 COMPREHENSIVE BACKEND ENDPOINT TEST\n');

// Test all critical endpoints
const tests = [
  {
    name: 'Health Check',
    path: '/health',
    method: 'GET',
    data: null
  },
  {
    name: 'Early Access',
    path: '/api/early-access',
    method: 'POST',
    data: {
      name: 'Test User',
      email: 'test' + Date.now() + '@example.com',
      occupation: 'Tester'
    }
  },
  {
    name: 'Registration + Auto-Login',
    path: '/api/auth/register',
    method: 'POST',
    data: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test' + Date.now() + '@example.com',
      password: 'TestPassword123',
      country: 'US'
    }
  }
];

async function runTest(test) {
  return new Promise((resolve) => {
    const postData = test.data ? JSON.stringify(test.data) : null;
    
    const options = {
      hostname: 'qb-securiegnty-backend.onrender.com',
      port: 443,
      path: test.path,
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://qb-securiegnty.netlify.app',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      },
      timeout: 15000
    };

    console.log(`🧪 Testing ${test.name}...`);
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`  📊 Status: ${res.statusCode}`);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response = JSON.parse(data);
          console.log(`  ✅ ${test.name}: SUCCESS`);
          
          // Special checks for specific endpoints
          if (test.path === '/api/auth/register') {
            console.log(`    🔑 Has Token: ${!!response.token}`);
            console.log(`    👤 Has User: ${!!response.user}`);
            console.log(`    🆕 New Signup: ${response.isNewSignup}`);
            console.log(`    ➡️ Redirect: ${response.redirectTo}`);
          }
        } else {
          console.log(`  ⚠️ ${test.name}: ${data}`);
        }
        
        console.log(`  🔒 CORS Origin: ${res.headers['access-control-allow-origin']}`);
        console.log(`  🔒 CORS Credentials: ${res.headers['access-control-allow-credentials']}\n`);
        
        resolve({ success: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode });
      });
    });

    req.on('error', (error) => {
      console.log(`  ❌ ${test.name}: ${error.message}\n`);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      console.log(`  ⏰ ${test.name}: Timeout\n`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Run all tests
async function runAllTests() {
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push({ ...test, ...result });
  }
  
  console.log('📋 SUMMARY REPORT:');
  console.log('================');
  
  let allPassed = true;
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name} (${result.status || result.error})`);
    if (!result.success) allPassed = false;
  });
  
  console.log('\n🎯 OVERALL STATUS:');
  if (allPassed) {
    console.log('✅ ALL SYSTEMS OPERATIONAL!');
    console.log('🚀 Your website is fully functional at: https://qb-securiegnty.netlify.app');
  } else {
    console.log('⚠️ Some endpoints have issues - check details above');
  }
}

runAllTests().catch(console.error);
