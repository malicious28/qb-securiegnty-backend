// Test registration with different email to bypass existing user issue
require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testRegistrationEmail() {
    console.log('🧪 Testing Registration Email with New User...\n');
    
    // Start server first
    console.log('🚀 Starting server...');
    const { spawn } = require('child_process');
    const server = spawn('node', ['server.js'], { 
        stdio: 'pipe',
        cwd: __dirname
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
        // Test Registration with unique email
        const timestamp = Date.now();
        const testEmail = `test-${timestamp}@example.com`;
        
        console.log(`👤 Testing User Registration with: ${testEmail}`);
        const registrationData = {
            firstName: 'Test',
            lastName: 'User',
            email: testEmail,
            password: 'TestPassword123!'
        };
        
        try {
            const regResponse = await axios.post(`${API_BASE}/auth/register`, registrationData);
            console.log('   ✅ Registration API call successful');
            console.log('   📧 Welcome email should have been sent');
            console.log('   📋 Response:', regResponse.data);
        } catch (error) {
            console.log('   ❌ Registration failed:', error.response?.data?.error || error.message);
            if (error.response?.data?.details) {
                console.log('   📋 Error details:', error.response.data.details);
            }
        }
        
        console.log('\n🎯 Registration Test Summary:');
        console.log(`📧 Check logs to see if welcome email was sent to: ${testEmail}`);
        console.log('💡 If email is not being sent:');
        console.log('   1. Check server console for email sending logs');
        console.log('   2. Verify email service is being called');
        console.log('   3. Check RESEND_API_KEY configuration');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        // Clean up server
        server.kill();
        console.log('\n🛑 Server stopped');
    }
}

// Run the test
testRegistrationEmail();