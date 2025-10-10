// Test password reset email functionality
require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testPasswordResetEmail() {
    console.log('🧪 Testing Password Reset Email...\n');
    
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
        // Test Password Reset Email
        console.log('🔑 Testing Password Reset Email...');
        const resetData = {
            email: 'ashikamishra63@gmail.com'
        };
        
        try {
            const resetResponse = await axios.post(`${API_BASE}/auth/forgot-password`, resetData);
            console.log('   ✅ Password reset API call successful');
            console.log('   📧 Password reset email should have been sent');
            console.log('   📋 Response:', resetResponse.data);
        } catch (error) {
            console.log('   ❌ Password reset failed:', error.response?.data?.error || error.message);
            if (error.response?.data?.details) {
                console.log('   📋 Error details:', error.response.data.details);
            }
        }
        
        console.log('\n🎯 Password Reset Test Summary:');
        console.log('📧 Check your email (ashikamishra63@gmail.com) for password reset link');
        console.log('💡 If email is not received:');
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

// Run the test
testPasswordResetEmail();