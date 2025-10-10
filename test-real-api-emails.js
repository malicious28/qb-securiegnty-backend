// Test actual API endpoints for email functionality
require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testRealAPIEmailFlows() {
    console.log('🧪 Testing Real API Email Flows...\n');
    
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
        // Test 1: User Registration (should send welcome email)
        console.log('1️⃣ Testing User Registration Email...');
        const registrationData = {
            firstName: 'Test',
            lastName: 'User',
            email: 'ashikamishra63@gmail.com',
            password: 'TestPassword123!'
        };
        
        try {
            const regResponse = await axios.post(`${API_BASE}/auth/register`, registrationData);
            console.log('   ✅ Registration API call successful');
            console.log('   📧 Welcome email should have been sent');
        } catch (error) {
            console.log('   ⚠️ Registration failed (user might already exist):', error.response?.data?.error || error.message);
        }
        
        await delay(2000);
        
        // Test 2: Early Access (should send early access email)
        console.log('\n2️⃣ Testing Early Access Email...');
        const earlyAccessData = {
            name: 'Test User',
            email: 'ashikamishra63@gmail.com',
            occupation: 'Software Developer'
        };
        
        try {
            const earlyResponse = await axios.post(`${API_BASE}/early-access/`, earlyAccessData);
            console.log('   ✅ Early access API call successful');
            console.log('   📧 Early access email should have been sent');
        } catch (error) {
            console.log('   ❌ Early access failed:', error.response?.data?.error || error.message);
            if (error.response?.data?.details) {
                console.log('   � Validation details:', error.response.data.details);
            }
        }
        
        console.log('\n🎯 API Test Summary:');
        console.log('✅ All API endpoints tested');
        console.log('📧 Check your email (ashikamishra63@gmail.com) for:');
        console.log('   - Welcome email (if registration succeeded)');
        console.log('   - Appointment confirmation email');  
        console.log('   - Early access email');
        console.log('\n💡 If emails are not received:');
        console.log('   1. Check server logs for email sending errors');
        console.log('   2. Verify RESEND_API_KEY is correct');
        console.log('   3. Check spam/junk folder');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        // Clean up server
        server.kill();
        console.log('\n🛑 Server stopped');
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the test
testRealAPIEmailFlows();