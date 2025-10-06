#!/usr/bin/env node

/**
 * Test deployed OAuth endpoint
 */

const https = require('https');

const url = 'https://qb-securiegnty-backend.onrender.com/api/auth/google';

console.log('\n🧪 Testing Deployed OAuth Endpoint\n');
console.log('URL:', url);
console.log('=' .repeat(70) + '\n');

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Testing OAuth)'
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  console.log('\nHeaders:');
  console.log(JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }
    
    console.log('\n' + '=' .repeat(70));
    
    if (res.statusCode === 302 || res.statusCode === 301) {
      console.log('✅ SUCCESS: Redirecting to Google OAuth');
      console.log('Redirect Location:', res.headers.location);
    } else if (res.statusCode === 404) {
      console.log('❌ ERROR: Endpoint not found');
      console.log('Possible causes:');
      console.log('1. Routes not loaded properly on Render');
      console.log('2. Passport middleware not initialized');
      console.log('3. Deployment issue');
    } else if (res.statusCode === 500) {
      console.log('❌ ERROR: Server error');
      console.log('Check Render logs for details');
    }
  });
}).on('error', (err) => {
  console.error('❌ Request failed:', err.message);
});
