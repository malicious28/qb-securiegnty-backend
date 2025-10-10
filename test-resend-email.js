// Test file to verify Resend email functionality
require('dotenv').config();
const emailService = require('./utils/emailService');

async function testResendEmail() {
    console.log('🧪 Testing Resend Email Service...\n');
    
    try {
        // Test connection
        console.log('1. Testing email service configuration...');
        const isReady = await emailService.testConnection();
        
        if (!isReady) {
            console.log('❌ Email service not ready. Check your RESEND_API_KEY in .env file');
            return;
        }

        // Test sending a simple email
        console.log('\n2. Sending test email...');
        const result = await emailService.sendEmail({
            to: 'ashikamishra63@gmail.com',
            subject: 'Hello World from Resend!',
            html: '<p>Congrats on sending your <strong>first email</strong> with Resend!</p>'
        });

        console.log('✅ Test email sent successfully!');
        console.log('📧 Email ID:', result.data?.id || result.id || 'Email sent');
        console.log('📊 Full result:', JSON.stringify(result, null, 2));
        
        // Test welcome email
        console.log('\n3. Testing welcome email template...');
        const welcomeResult = await emailService.sendWelcomeEmail(
            'ashikamishra63@gmail.com', 
            'Ashika Mishra'
        );
        
        console.log('✅ Welcome email sent successfully!');
        console.log('📧 Welcome Email ID:', welcomeResult.data?.id || welcomeResult.id || 'Email sent');

        console.log('\n🎉 All tests passed! Resend email service is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('🔍 Error details:', error);
    }
}

// Run the test
testResendEmail();