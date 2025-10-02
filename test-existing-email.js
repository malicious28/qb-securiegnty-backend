const axios = require('axios');

async function testExistingEmail() {
  const testEmail = 'existing' + Date.now() + '@example.com';
  
  try {
    console.log('Testing registration with existing email...', testEmail);
    
    // First registration
    await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: 'TestPassword123!'
    });
    console.log('✅ First registration successful');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Second registration with same email
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Test',
      lastName: 'UserTwo',
      email: testEmail,
      password: 'TestPassword123!'
    });
    
    console.log('This should not print - second registration should fail');
    
  } catch (error) {
    console.log('❌ EXPECTED ERROR - Response Status:', error.response?.status);
    console.log('❌ EXPECTED ERROR - Response Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testExistingEmail();