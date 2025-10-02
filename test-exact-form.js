const axios = require('axios');

async function testWithExactFormData() {
  try {
    console.log('🧪 TESTING WITH EXACT FORM DATA FROM SCREENSHOT...');
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Ashika',
      lastName: 'Mishra',
      email: 'ashikamishra64@gmail.com',
      password: 'Ashika28@',
      country: 'US'
    });
    
    console.log('✅ BACKEND SUCCESS - Status:', response.status);
    console.log('✅ BACKEND SUCCESS - Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ BACKEND ERROR - Status:', error.response?.status);
    console.log('❌ BACKEND ERROR - Data:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 409) {
      console.log('🔍 This email already exists in database - that\'s why it\'s failing');
    }
  }
}

testWithExactFormData();