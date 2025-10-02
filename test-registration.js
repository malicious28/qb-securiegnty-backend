const axios = require('axios');

async function testRegistration() {
  try {
    console.log('Testing registration with fresh email...');
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: 'freshtest' + Date.now() + '@example.com',
      password: 'TestPassword123!'
    });
    
    console.log('✅ SUCCESS - Response Status:', response.status);
    console.log('✅ SUCCESS - Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ ERROR - Response Status:', error.response?.status);
    console.log('❌ ERROR - Response Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testRegistration();