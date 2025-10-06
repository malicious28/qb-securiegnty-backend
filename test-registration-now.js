const axios = require('axios');

async function testRegistration() {
  try {
    console.log('🧪 Testing registration with screenshot data...\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Ashika',
      lastName: 'Mishra',
      email: 'ashikamishra63@gmail.com',
      password: 'Ashika28@',
      country: 'United States'
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Registration failed with status:', error.response.status);
      console.error('Error response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Network or system error:', error.message);
    }
  }
}

testRegistration();
