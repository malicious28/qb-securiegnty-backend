const https = require('https');

console.log('🔗 Testing Frontend-Backend Connection\n');

// Test CORS and registration endpoint
function testConnection() {
  const testData = JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    email: 'test' + Date.now() + '@example.com',
    password: 'TestPassword123',
    country: 'US'
  });

  const options = {
    hostname: 'qb-securiegnty-backend.onrender.com',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://qb-securiegnty.netlify.app',
      'Content-Length': Buffer.byteLength(testData)
    }
  };

  console.log('🧪 Testing registration with auto-login...');
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`📊 Status: ${res.statusCode}`);
      
      if (res.statusCode === 201) {
        const response = JSON.parse(data);
        console.log('✅ Registration Success!');
        console.log(`📝 Message: ${response.message}`);
        console.log(`🔑 Has Token: ${!!response.token}`);
        console.log(`👤 Has User Data: ${!!response.user}`);
        console.log(`🆕 Is New Signup: ${response.isNewSignup}`);
        console.log(`➡️ Redirect To: ${response.redirectTo}`);
        console.log('\n🎉 AUTO-LOGIN + ONBOARDING REDIRECT IS WORKING!');
      } else {
        console.log(`⚠️ Response: ${data}`);
      }
      
      console.log('\n🔒 CORS Headers:');
      console.log(`   Origin: ${res.headers['access-control-allow-origin']}`);
      console.log(`   Credentials: ${res.headers['access-control-allow-credentials']}`);
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Connection failed: ${error.message}`);
  });

  req.write(testData);
  req.end();
}

testConnection();
