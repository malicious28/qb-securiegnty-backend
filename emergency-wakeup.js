const https = require('https');

console.log('🔥 EMERGENCY BACKEND WAKE-UP AND DIAGNOSIS\n');

// Function to ping the backend multiple times to wake it up
async function wakeUpBackend() {
  console.log('⏰ Attempting to wake up backend service...');
  
  for (let i = 1; i <= 5; i++) {
    await new Promise((resolve) => {
      console.log(`🔔 Wake-up attempt ${i}/5...`);
      
      const req = https.request({
        hostname: 'qb-securiegnty-backend.onrender.com',
        port: 443,
        path: '/health',
        method: 'GET',
        timeout: 30000
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log(`✅ Attempt ${i}: ${res.statusCode} - ${data.substring(0, 100)}`);
          resolve();
        });
      });

      req.on('error', (error) => {
        console.log(`❌ Attempt ${i}: ${error.message}`);
        resolve();
      });

      req.on('timeout', () => {
        console.log(`⏱️ Attempt ${i}: Timeout (service may be sleeping)`);
        req.destroy();
        resolve();
      });

      req.end();
    });

    // Wait between attempts
    if (i < 5) {
      console.log('⏳ Waiting 10 seconds before next attempt...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

// Function to test early access after wake-up
async function testEarlyAccessAfterWakeup() {
  console.log('\n🎯 Testing early access endpoint after wake-up...');
  
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      occupation: 'Tester'
    });

    const req = https.request({
      hostname: 'qb-securiegnty-backend.onrender.com',
      port: 443,
      path: '/api/early-access',
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
        console.log(`📊 Early access status: ${res.statusCode}`);
        console.log(`📝 Response: ${data}`);
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Early access failed: ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      console.log('❌ Early access timeout');
      req.destroy();
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  await wakeUpBackend();
  await testEarlyAccessAfterWakeup();
  
  console.log('\n🔧 DIAGNOSIS COMPLETE');
  console.log('If backend is still showing 502 errors, the service may need manual restart in Render dashboard.');
}

main().catch(console.error);
