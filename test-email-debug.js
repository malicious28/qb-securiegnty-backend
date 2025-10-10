// Load environment variables
require('dotenv').config();

// Email Service Debug Test
const emailService = require('./utils/emailService');

async function debugEmailService() {
    console.log('🔍 Email Service Debug Test');
    console.log('═══════════════════════════════════════');
    
    // Check environment variables
    console.log('🌍 Environment Variables:');
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    console.log('  RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);
    console.log('  RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
    console.log('  RESEND_API_KEY prefix:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
    console.log('  SENDER_EMAIL:', process.env.SENDER_EMAIL);
    console.log('');
    
    try {
        // Test initialization
        console.log('🚀 Testing Email Service...');
        console.log('  Email service instance loaded');
        
        // Test setup
        console.log('⚙️ Testing setupResend...');
        await emailService.setupResend();
        console.log('  setupResend completed');
        
        // Test configuration status
        console.log('📋 Service Status:');
        console.log('  isConfigured:', emailService.isConfigured);
        console.log('  resend instance:', !!emailService.resend);
        
        if (emailService.isConfigured) {
            // Test connection
            console.log('🔗 Testing connection...');
            const connectionTest = await emailService.testConnection();
            console.log('  Connection test result:', connectionTest);
            
            // Test sending email
            console.log('📧 Testing email send...');
            const testEmail = {
                to: 'admin@qbsecuriegnty.com',
                subject: 'Email Service Debug Test',
                html: '<h1>Debug Test Email</h1><p>If you receive this, the email service is working!</p>'
            };
            
            const result = await emailService.sendEmail(testEmail);
            console.log('  Email send result:', result);
            console.log('✅ All tests passed!');
        } else {
            console.log('❌ Service not configured - cannot proceed with tests');
        }
        
    } catch (error) {
        console.error('❌ Debug test failed:', error);
        console.error('  Error message:', error.message);
        console.error('  Error stack:', error.stack);
    }
    
    console.log('═══════════════════════════════════════');
    console.log('🏁 Debug test completed');
}

// Run the debug test
debugEmailService().catch(console.error);