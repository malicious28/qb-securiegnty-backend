// Final test to verify appointment booking with Resend email
require('dotenv').config();
const emailService = require('./utils/emailService');

async function testAppointmentEmail() {
    console.log('🧪 Testing Appointment Email with Resend...\n');
    
    try {
        // Test appointment confirmation email
        const appointmentData = {
            to: 'ashikamishra63@gmail.com',
            name: 'Ashika Mishra',
            date: '2025-10-15',
            phone: '+91 8989804121',
            message: 'Looking forward to discussing QB Securiegnty services'
        };

        console.log('📧 Sending appointment confirmation email...');
        const result = await emailService.sendAppointmentConfirmationEmail(appointmentData);
        
        console.log('✅ Appointment email sent successfully!');
        console.log('📧 Email ID:', result.data?.id || 'sent');
        
        console.log('\n🎉 Appointment email system is working with Resend!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('🔍 Error details:', error);
    }
}

// Run the test
testAppointmentEmail();