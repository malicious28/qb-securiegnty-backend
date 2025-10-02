const axios = require('axios');

async function testWithActualEmail() {
  try {
    console.log('Testing with ashikamishra63@gmail.com...');
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Ashika',
      lastName: 'Mishra', 
      email: 'ashikamishra63@gmail.com',
      password: 'TestPassword123!'
    });
    
    console.log('✅ SUCCESS:', response.status, response.data);
    
  } catch (error) {
    console.log('❌ LOCAL BACKEND ERROR:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Full Error:', error.message);
  }
}

testWithActualEmail();