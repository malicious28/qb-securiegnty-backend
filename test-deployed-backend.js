// Diagnostic script to test deployed backend
// Run this to test your deployed backend endpoints

const testEndpoints = async () => {
  const baseUrl = 'https://qb-securiegnty-backend.onrender.com'; // Update with your actual Render URL
  
  const endpoints = [
    '/',
    '/health',
    '/api/status',
    '/security-status',
    '/api/auth/register',  // This should return method not allowed or similar, not 404
  ];

  console.log('🧪 Testing deployed backend endpoints...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${baseUrl}${endpoint}`);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`✅ Status: ${response.status} ${response.statusText}`);
      
      if (response.ok || response.status < 500) {
        try {
          const data = await response.text();
          console.log(`📄 Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        } catch (e) {
          console.log(`📄 Response: [Could not parse response]`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('---\n');
  }
};

// Run the test
testEndpoints().catch(console.error);