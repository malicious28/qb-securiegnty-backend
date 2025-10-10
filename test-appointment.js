// Test script for appointment booking
const fetch = require('node-fetch');

async function testAppointment() {
  try {
    console.log('🧪 Testing appointment booking endpoint...');
    
    // First, let's try to get a JWT token by registering/logging in
    const testUser = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      country: 'US',
      firstName: 'Test',
      lastName: 'User'
    };

    console.log('📝 Attempting to register test user...');
    
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const registerResult = await registerResponse.text();
    console.log('Register response:', registerResult);

    if (registerResponse.status === 409) {
      console.log('User already exists, trying to login...');
      
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      const loginResult = await loginResponse.json();
      console.log('Login response:', loginResult);

      if (loginResponse.ok && loginResult.token) {
        await testAppointmentBooking(loginResult.token);
      } else {
        console.error('❌ Login failed:', loginResult);
      }
    } else if (registerResponse.ok) {
      const registerData = JSON.parse(registerResult);
      if (registerData.token) {
        await testAppointmentBooking(registerData.token);
      } else {
        console.error('❌ No token in register response');
      }
    } else {
      console.error('❌ Registration failed:', registerResult);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testAppointmentBooking(token) {
  try {
    console.log('📅 Testing appointment booking with token...');
    
    const appointmentData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      message: 'Test appointment booking',
      appointmentDate: '2025-10-15T10:00:00Z',
      appointmentType: 'consultation'
    };

    const response = await fetch('http://localhost:5000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });

    const result = await response.text();
    console.log('📊 Appointment response status:', response.status);
    console.log('📊 Appointment response:', result);

    if (response.ok) {
      console.log('✅ Appointment booking test PASSED!');
    } else {
      console.error('❌ Appointment booking test FAILED!');
    }

  } catch (error) {
    console.error('❌ Appointment test error:', error.message);
  }
}

// Run the test
testAppointment();