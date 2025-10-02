const axios = require('axios');

async function testExactFormData() {
  try {
    console.log('🧪 TESTING EXACT FORM DATA FROM SCREENSHOT...');
    
    const response = await axios.post('http://localhost:5001/api/auth/register', {
      firstName: 'Ashika',
      lastName: 'Mishra',
      email: 'ashikamishra64@gmail.com',
      password: 'Ashika28@',
      country: 'US'
    });
    
    console.log('✅ SUCCESS - Status:', response.status);
    console.log('✅ SUCCESS - Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ ERROR - Status:', error.response?.status);
    console.log('❌ ERROR - Response:', JSON.stringify(error.response?.data, null, 2));
    console.log('❌ Full Error:', error.message);
    
    // Check if it's a validation error
    if (error.response?.data?.details) {
      console.log('🔍 VALIDATION DETAILS:');
      error.response.data.details.forEach(detail => {
        console.log(`  - Field: ${detail.path}, Error: ${detail.msg}`);
      });
    }
  }
}

testExactFormData();