const axios = require('axios');

async function testRegistrationFix() {
  const testEmail = 'newtest' + Date.now() + '@example.com';
  
  try {
    console.log('Testing registration fix with email:', testEmail);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: 'TestPassword123!'
    });
    
    console.log('✅ SUCCESS - Response Status:', response.status);
    console.log('✅ SUCCESS - Response Data:', JSON.stringify(response.data, null, 2));
    
    // Now test with the same email to see if it properly detects duplicate
    console.log('\n--- Testing duplicate email detection ---');
    
    try {
      const duplicateResponse = await axios.post('http://localhost:5000/api/auth/register', {
        firstName: 'Test',
        lastName: 'User2',
        email: testEmail,
        password: 'TestPassword123!'
      });
      
      console.log('❌ UNEXPECTED: Duplicate registration succeeded');
      
    } catch (duplicateError) {
      console.log('✅ EXPECTED: Duplicate email properly rejected');
      console.log('Status:', duplicateError.response?.status);
      console.log('Error:', duplicateError.response?.data?.error);
    }
    
  } catch (error) {
    console.log('❌ ERROR - Response Status:', error.response?.status);
    console.log('❌ ERROR - Response Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

// Wait for server to start, then test
setTimeout(testRegistrationFix, 3000);