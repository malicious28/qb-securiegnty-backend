// Emergency Backend Wake-Up Script
const https = require('https');

console.log('🚨 Emergency Backend Wake-Up');

const options = {
  hostname: 'qb-securiegnty-backend.onrender.com',
  path: '/health',
  method: 'GET',
  timeout: 30000
};

const req = https.request(options, (res) => {
  console.log(`✅ Backend Status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('✅ Backend Response:', JSON.parse(data));
    console.log('✅ Backend is awake and healthy!');
  });
});

req.on('error', (error) => {
  console.log('❌ Backend Error:', error.message);
});

req.on('timeout', () => {
  console.log('⏰ Request timed out - backend might be sleeping');
  req.destroy();
});

req.end();
