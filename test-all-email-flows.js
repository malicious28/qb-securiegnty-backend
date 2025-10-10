// Comprehensive test for all email flows with new domain
require('dotenv').config();
const emailService = require('./utils/emailService');

async function testAllEmailFlows() {
    console.log('🧪 Testing All Email Flows with admin@qbsecuriegnty.com...\n');
    
    const testEmail = 'ashikamishra63@gmail.com';
    const results = [];
    
    try {
        // 1. Test Welcome Email (Sign Up)
        console.log('1️⃣ Testing Welcome Email (Sign Up)...');
        try {
            const welcomeResult = await emailService.sendWelcomeEmail(
                testEmail, 
                'Ashika Mishra'
            );
            results.push({ type: 'Welcome/Sign Up', status: '✅ Success', id: welcomeResult.data?.id });
            console.log('   ✅ Welcome email sent successfully');
        } catch (error) {
            results.push({ type: 'Welcome/Sign Up', status: '❌ Failed', error: error.message });
            console.log('   ❌ Welcome email failed:', error.message);
        }

        await delay(2000); // Wait 2 seconds between emails

        // 2. Test Password Reset Email (Login flow)
        console.log('\n2️⃣ Testing Password Reset Email (Login flow)...');
        try {
            const resetResult = await emailService.sendPasswordResetEmail(
                testEmail,
                'sample-reset-token-123'
            );
            results.push({ type: 'Password Reset', status: '✅ Success', id: resetResult.data?.id });
            console.log('   ✅ Password reset email sent successfully');
        } catch (error) {
            results.push({ type: 'Password Reset', status: '❌ Failed', error: error.message });
            console.log('   ❌ Password reset email failed:', error.message);
        }

        await delay(2000);

        // 3. Test Appointment Confirmation Email
        console.log('\n3️⃣ Testing Appointment Confirmation Email...');
        try {
            const appointmentData = {
                to: testEmail,
                name: 'Ashika Mishra',
                date: '2025-10-15',
                phone: '+91 8989804121',
                message: 'Looking forward to discussing QB Securiegnty services'
            };
            
            const appointmentResult = await emailService.sendAppointmentConfirmationEmail(appointmentData);
            results.push({ type: 'Appointment Confirmation', status: '✅ Success', id: appointmentResult.data?.id });
            console.log('   ✅ Appointment email sent successfully');
        } catch (error) {
            results.push({ type: 'Appointment Confirmation', status: '❌ Failed', error: error.message });
            console.log('   ❌ Appointment email failed:', error.message);
        }

        await delay(2000);

        // 4. Test Early Access Email
        console.log('\n4️⃣ Testing Early Access Email...');
        try {
            const earlyAccessResult = await emailService.sendEarlyAccessEmail(
                testEmail,
                'Ashika Mishra'
            );
            results.push({ type: 'Early Access', status: '✅ Success', id: earlyAccessResult.data?.id });
            console.log('   ✅ Early access email sent successfully');
        } catch (error) {
            results.push({ type: 'Early Access', status: '❌ Failed', error: error.message });
            console.log('   ❌ Early access email failed:', error.message);
        }

        // Display results summary
        console.log('\n📊 EMAIL TESTING SUMMARY');
        console.log('=' .repeat(50));
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.type}: ${result.status}`);
            if (result.id) {
                console.log(`   📧 Email ID: ${result.id}`);
            }
            if (result.error) {
                console.log(`   ⚠️ Error: ${result.error}`);
            }
        });

        const successCount = results.filter(r => r.status.includes('Success')).length;
        const totalCount = results.length;
        
        console.log('\n🎯 OVERALL RESULTS:');
        console.log(`   ✅ Successful: ${successCount}/${totalCount}`);
        console.log(`   ❌ Failed: ${totalCount - successCount}/${totalCount}`);
        
        if (successCount === totalCount) {
            console.log('\n🎉 ALL EMAIL FLOWS WORKING PERFECTLY!');
            console.log('✅ Your QB Securiegnty email system is ready for production!');
        } else {
            console.log('\n⚠️ Some email flows need attention.');
            console.log('💡 Check domain verification status in Resend dashboard.');
        }

    } catch (error) {
        console.error('❌ Critical test failure:', error.message);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the comprehensive test
testAllEmailFlows();