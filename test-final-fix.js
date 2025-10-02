const axios = require('axios');

async function testCompletelyFreshEmail() {
  const freshEmail = 'completelynew' + Date.now() + '@example.com';
  
  try {
    console.log('🧪 TESTING COMPLETELY FRESH EMAIL:', freshEmail);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: freshEmail,
      password: 'TestPassword123!'
    });
    
    console.log('✅ SUCCESS - Status:', response.status);
    console.log('✅ SUCCESS - Response:', JSON.stringify(response.data, null, 2));
    
    // Test duplicate detection
    console.log('\n🧪 TESTING DUPLICATE EMAIL...');
    
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        firstName: 'Test2',
        lastName: 'User2',
        email: freshEmail,
        password: 'TestPassword123!'
      });
      console.log('❌ UNEXPECTED: Duplicate should have failed!');
    } catch (dupError) {
      console.log('✅ EXPECTED: Duplicate properly rejected');
      console.log('Status:', dupError.response?.status);
      console.log('Error:', dupError.response?.data?.error);
    }
    
  } catch (error) {
    console.log('❌ ERROR - Status:', error.response?.status);
    console.log('❌ ERROR - Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testCompletelyFreshEmail();