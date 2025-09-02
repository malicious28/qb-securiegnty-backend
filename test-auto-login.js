const https = require('https');

console.log('🔐 Testing Registration Auto-Login Fix\n');

// Test registration with auto-login
async function testRegistration() {
  console.log('📝 Testing registration with auto-login...');
  
  const testUser = {
    firstName: 'Test',
    lastName: 'User', 
    email: `test${Date.now()}@example.com`, // Unique email
    password: 'testpassword123',
    country: 'Test Country'
  };

  return new Promise((resolve) => {
    const postData = JSON.stringify(testUser);

    const req = https.request({
      hostname: 'qb-securiegnty-backend.onrender.com',
      port: 443,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://qbsecuriegnty.com',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📊 Registration Status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          console.log(`✅ Registration Response:`, {
            message: response.message,
            hasToken: !!response.token,
            hasUser: !!response.user,
            userInfo: response.user ? `${response.user.firstName} ${response.user.lastName}` : 'None'
          });
          resolve(response);
        } catch (e) {
          console.log(`❌ Registration Response: ${data}`);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Registration failed: ${error.message}`);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

// Test login response format
async function testLogin() {
  console.log('\n🔑 Testing login response format...');
  
  const loginData = {
    email: 'test@example.com', // This will fail, but we can see the response format
    password: 'wrongpassword'
  };

  return new Promise((resolve) => {
    const postData = JSON.stringify(loginData);

    const req = https.request({
      hostname: 'qb-securiegnty-backend.onrender.com', 
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://qbsecuriegnty.com',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📊 Login Status: ${res.statusCode}`);
        console.log(`📝 Login Response: ${data}`);
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Login failed: ${error.message}`);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  const registrationResult = await testRegistration();
  await testLogin();
  
  console.log('\n📋 SUMMARY:');
  if (registrationResult && registrationResult.token && registrationResult.user) {
    console.log('✅ Registration now includes token and user data for auto-login!');
    console.log('✅ Users will be automatically logged in after registration!');
  } else {
    console.log('⚠️ Registration response needs to be checked');
  }
  
  console.log('\n🎯 Frontend should now:');
  console.log('   1. Store the token from registration response');
  console.log('   2. Store the user data from registration response'); 
  console.log('   3. Redirect user to dashboard/profile after registration');
  console.log('   4. Show "Welcome [firstName]!" message');
}

main().catch(console.error);
