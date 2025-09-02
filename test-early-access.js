const https = require('https');

console.log('🔍 Testing Early Access Endpoint...\n');

// Test the early access endpoint without auth first
function testEarlyAccessEndpoint() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      name: 'Test User',
      email: 'test@example.com', 
      occupation: 'Tester'
    });

    const options = {
      hostname: 'qb-securiegnty-backend.onrender.com',
      port: 443,
      path: '/api/early-access',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://qbsecuriegnty.com',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 15000
    };

    console.log('🎯 Testing /api/early-access endpoint...');
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📝 Response: ${data}`);
        console.log(`🔒 CORS Headers:`);
        console.log(`   Origin: ${res.headers['access-control-allow-origin']}`);
        console.log(`   Credentials: ${res.headers['access-control-allow-credentials']}`);
        resolve(true);
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request failed: ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ Request timeout');
      req.destroy();
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

testEarlyAccessEndpoint().catch(console.error);
