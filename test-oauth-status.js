const http = require('http');

console.log('🧪 Testing Google OAuth endpoint...\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/security-status',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Status Code:', res.statusCode);
    console.log('Response:');
    try {
      const data = JSON.parse(body);
      console.log(JSON.stringify(data, null, 2));
      
      if (data.securityFeatures && data.securityFeatures.googleOAuth === 'Active') {
        console.log('\n✅ Google OAuth is ACTIVE and working!');
      } else {
        console.log('\n⚠️ Google OAuth status unclear');
      }
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.end();
