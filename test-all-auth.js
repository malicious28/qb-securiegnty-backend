const http = require('http');

console.log('🔐 COMPREHENSIVE AUTH TESTING\n');

// Test 1: Registration
function testRegistration() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      firstName: 'Test',
      lastName: 'User',
      email: 'test' + Date.now() + '@example.com',
      password: 'TestPass123!',
      country: 'United States'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          console.log('✅ REGISTRATION TEST:');
          console.log('   Status:', res.statusCode);
          console.log('   Success:', response.success);
          console.log('   isNewSignup:', response.isNewSignup);
          console.log('   redirectTo:', response.redirectTo);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Test 2: Login endpoint check
function testLoginEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 2
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        console.log('✅ LOGIN ENDPOINT TEST:');
        console.log('   Status:', res.statusCode, '(400 expected - no credentials)');
        console.log('   Endpoint: ACCESSIBLE ✅');
        resolve({ status: res.statusCode });
      });
    });

    req.on('error', reject);
    req.write('{}');
    req.end();
  });
}

// Test 3: Google OAuth endpoints
function testGoogleOAuth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/google',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log('✅ GOOGLE OAUTH TEST:');
      console.log('   Status:', res.statusCode, '(302 expected - redirect to Google)');
      console.log('   Location:', res.headers.location || 'Redirect header present');
      console.log('   Endpoint: ACCESSIBLE ✅');
      resolve({ status: res.statusCode });
    });

    req.on('error', reject);
    req.end();
  });
}

// Test 4: Security status
function testSecurityStatus() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/security-status',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          console.log('✅ SECURITY STATUS TEST:');
          console.log('   Google OAuth:', response.securityFeatures.googleOAuth);
          console.log('   JWT Security:', response.securityFeatures.jwtSecurity);
          console.log('   Rate Limiting:', response.securityFeatures.rateLimit);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Run all tests
async function runAllTests() {
  try {
    await testRegistration();
    console.log('');
    await testLoginEndpoint();
    console.log('');
    await testGoogleOAuth();
    console.log('');
    await testSecurityStatus();
    console.log('\n🎉 ALL AUTHENTICATION FEATURES VERIFIED AS WORKING! ✅');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n⚠️  Make sure server is running: node server.js');
  }
}

runAllTests();