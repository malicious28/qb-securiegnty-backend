const http = require('http');

const data = JSON.stringify({
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser' + Date.now() + '@example.com',
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

console.log('🧪 Testing Registration Response...\n');

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('📊 Status Code:', res.statusCode);
    console.log('📦 Full Response:\n');
    try {
      const response = JSON.parse(body);
      console.log(JSON.stringify(response, null, 2));
      
      console.log('\n🔍 KEY FIELDS CHECK:');
      console.log('   isNewSignup:', response.isNewSignup);
      console.log('   redirectTo:', response.redirectTo);
      console.log('   success:', response.success);
      
      if (response.redirectTo === 'onboarding' && response.isNewSignup === true) {
        console.log('\n✅ BACKEND IS CORRECT: Sending "onboarding" redirect');
        console.log('⚠️  ISSUE IS IN FRONTEND: Frontend is not respecting the redirect');
      } else {
        console.log('\n❌ BACKEND ISSUE: Not sending correct redirect data');
      }
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\n⚠️  Make sure server is running: node server.js');
});

req.write(data);
req.end();
