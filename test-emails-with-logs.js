// Comprehensive test to capture server logs and see email sending
require('dotenv').config();
const axios = require('axios');
const { spawn } = require('child_process');

const API_BASE = 'http://localhost:5000/api';

async function testEmailsWithLogs() {
    console.log('🧪 Testing Email Functionality with Server Logs...\n');
    
    // Start server and capture logs
    console.log('🚀 Starting server with log capture...');
    const server = spawn('node', ['server.js'], { 
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: __dirname
    });
    
    let serverLogs = '';
    
    // Capture server output
    server.stdout.on('data', (data) => {
        const log = data.toString();
        serverLogs += log;
        console.log('📟 SERVER:', log.trim());
    });
    
    server.stderr.on('data', (data) => {
        const log = data.toString();
        serverLogs += log;
        console.log('🚨 ERROR:', log.trim());
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
        console.log('\n🔄 Testing Early Access Email...');
        
        const earlyAccessData = {
            name: 'Email Test User',
            email: 'ashikamishra63@gmail.com',
            occupation: 'Software Developer'
        };
        
        const response = await axios.post(`${API_BASE}/early-access/`, earlyAccessData);
        console.log('✅ Early Access Response:', response.data);
        
        // Wait a bit for email processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n📊 Email Sending Analysis:');
        const emailLogs = serverLogs.split('\n').filter(line => 
            line.includes('Email') || 
            line.includes('Resend') || 
            line.includes('📧') || 
            line.includes('✅') ||
            line.includes('❌')
        );
        
        if (emailLogs.length > 0) {
            console.log('📧 Email-related logs found:');
            emailLogs.forEach(log => console.log('   ', log.trim()));
        } else {
            console.log('⚠️ No email-related logs found in server output');
        }
        
        // Check if email service is being called
        if (serverLogs.includes('📧 Sending email to:')) {
            console.log('\n✅ EMAIL SERVICE IS WORKING!');
            console.log('📧 Emails are being sent successfully');
        } else if (serverLogs.includes('❌')) {
            console.log('\n❌ EMAIL ERRORS DETECTED');
            const errorLogs = serverLogs.split('\n').filter(line => line.includes('❌'));
            errorLogs.forEach(log => console.log('   ', log.trim()));
        } else {
            console.log('\n⚠️ EMAIL SERVICE MAY NOT BE CALLED');
            console.log('🔍 Email service might not be properly integrated in the routes');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        // Clean up server
        server.kill();
        console.log('\n🛑 Server stopped');
    }
}

// Run the test
testEmailsWithLogs();