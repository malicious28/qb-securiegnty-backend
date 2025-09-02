const https = require('https');
const http = require('http');

console.log('🔍 Testing Production Connection Setup...\n');

// Test 1: Check if backend is reachable
function testBackendHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'qb-securiegnty-backend.onrender.com',
      port: 443,
      path: '/health',
      method: 'GET',
      timeout: 10000
    };

    console.log('📡 Testing backend health endpoint...');
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ Backend health: ${res.statusCode} - ${data}`);
        resolve(true);
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Backend health failed: ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ Backend health timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Test 2: Check CORS preflight
function testCORS() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'qb-securiegnty-backend.onrender.com',
      port: 443,
      path: '/api/auth/register',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://qbsecuriegnty.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      },
      timeout: 10000
    };

    console.log('🔒 Testing CORS preflight...');
    
    const req = https.request(options, (res) => {
      console.log(`✅ CORS preflight: ${res.statusCode}`);
      console.log(`   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
      console.log(`   Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials']}`);
      resolve(true);
    });

    req.on('error', (error) => {
      console.log(`❌ CORS preflight failed: ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ CORS preflight timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Test 3: Test actual API endpoint
function testAPIEndpoint() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      test: 'connection'
    });

    const options = {
      hostname: 'qb-securiegnty-backend.onrender.com',
      port: 443,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://qbsecuriegnty.com',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 15000
    };

    console.log('🎯 Testing API endpoint...');
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ API endpoint: ${res.statusCode}`);
        console.log(`   Response: ${data.substring(0, 100)}...`);
        resolve(true);
      });
    });

    req.on('error', (error) => {
      console.log(`❌ API endpoint failed: ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ API endpoint timeout');
      req.destroy();
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive production connection test...\n');
  
  const healthTest = await testBackendHealth();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const corsTest = await testCORS();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const apiTest = await testAPIEndpoint();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   Backend Health: ${healthTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   CORS Setup: ${corsTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   API Endpoint: ${apiTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (healthTest && corsTest && apiTest) {
    console.log('\n🎉 ALL TESTS PASSED! Your backend is ready for production!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the details above.');
  }
}

runAllTests().catch(console.error);
