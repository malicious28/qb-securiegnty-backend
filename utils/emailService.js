const { Resend } = require('resend');

class EmailService {
    constructor() {
        this.resend = null;
        this.isConfigured = false;
        this.setupResend();
    }

    setupResend() {
        try {
            console.log('🔄 Setting up Resend email service...');
            console.log('🔍 Checking RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
            
            // Check if Resend API key is available
            if (!process.env.RESEND_API_KEY) {
                console.log('⚠️ RESEND_API_KEY not found in environment variables');
                console.log('📋 Available env variables:', Object.keys(process.env).filter(key => key.includes('RESEND')));
                return;
            }

            // Initialize Resend with API key
            this.resend = new Resend(process.env.RESEND_API_KEY);
            this.isConfigured = true;
            console.log('✅ Resend email service configured successfully');
            
        } catch (error) {
            console.error('❌ Resend email service configuration failed:', error.message);
            console.error('📋 Error stack:', error.stack);
            this.isConfigured = false;
        }
    }

    async testConnection() {
        if (!this.resend) {
            console.log('⚠️ Resend not configured');
            return false;
        }

        try {
            // Resend doesn't have a verify method like nodemailer, 
            // so we'll just check if the service is configured
            console.log('✅ Resend email service ready');
            return true;
        } catch (error) {
            console.error('❌ Resend connection test failed:', error.message);
            console.error('💡 Check your RESEND_API_KEY in .env file');
            this.isConfigured = false;
            return false;
        }
    }

    async sendEmail(mailOptions) {
        console.log('📧 sendEmail called with isConfigured:', this.isConfigured);
        console.log('📧 Resend instance:', this.resend ? 'Present' : 'Missing');
        
        if (!this.isConfigured || !this.resend) {
            console.error('❌ Resend email service not configured');
            console.error('📋 Debug info:', { 
                isConfigured: this.isConfigured, 
                hasResend: !!this.resend,
                hasApiKey: !!process.env.RESEND_API_KEY 
            });
            throw new Error('Email service not available');
        }

        try {
            console.log(`📧 Sending email to: ${mailOptions.to}`);
            
            // Primary sender: Custom domain (once verified)
            // Fallback: Resend default domain
            const senderEmail = process.env.SENDER_EMAIL || 'admin@qbsecuriegnty.com';
            let fromAddress = `QB Securiegnty Admin <${senderEmail}>`;
            
            const result = await this.resend.emails.send({
                from: fromAddress,
                to: mailOptions.to,
                subject: mailOptions.subject,
                html: mailOptions.html
            });
            console.log('✅ Email sent successfully:', result.data?.id || 'sent');
            console.log(`📤 Sent from: ${fromAddress}`);
            return result;
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
            
            // If custom domain fails, try fallback (for unverified domains)
            if (error.message.includes('domain') || error.message.includes('verify')) {
                console.log('🔄 Trying fallback sender...');
                try {
                    const result = await this.resend.emails.send({
                        from: 'QB Securiegnty <onboarding@resend.dev>',
                        to: mailOptions.to,
                        subject: mailOptions.subject,
                        html: mailOptions.html
                    });
                    console.log('✅ Email sent via fallback:', result.data?.id || 'sent');
                    console.log('⚠️ Note: Using fallback sender. Verify your domain in Resend dashboard.');
                    return result;
                } catch (fallbackError) {
                    console.error('❌ Fallback also failed:', fallbackError.message);
                    throw fallbackError;
                }
            }
            throw error;
        }
    }

    async sendEarlyAccessEmail(to, name) {
        const mailOptions = {
            to,
            subject: '🎉 Welcome to QB Securiegnty Early Access!',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; overflow: hidden;">
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; text-align: center; backdrop-filter: blur(10px);">
                        <h1 style="color: white; font-size: 2.5em; margin: 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);">🛡️ QB Securiegnty</h1>
                        <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.2em; margin: 10px 0;">Ultra-Secure Platform</p>
                    </div>
                    <div style="background: white; padding: 30px;">
                        <h2 style="color: #333; margin-top: 0;">Hi ${name || 'there'},</h2>
                        <p style="color: #555; line-height: 1.6;">Thank you for signing up for early access to <strong>QB Securiegnty</strong>!</p>
                        <p style="color: #555; line-height: 1.6;">🔒 You're now part of our exclusive early access program</p>
                        <p style="color: #555; line-height: 1.6;">🚀 You'll be the first to know about our launch</p>
                        <p style="color: #555; line-height: 1.6;">💎 Get exclusive updates and features</p>
                        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                            <p style="margin: 0; font-weight: bold;">🎉 Welcome to the future of security!</p>
                        </div>
                        <p style="color: #555; line-height: 1.6; margin-top: 30px;">Stay tuned for updates!</p>
                        <p style="color: #555; line-height: 1.6;"><strong>The QB Securiegnty Team</strong></p>
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center;">
                            If you did not request early access, you can safely ignore this email.
                        </div>
                    </div>
                </div>
            `
        };

        return await this.sendEmail(mailOptions);
    }

    async sendAppointmentConfirmationEmail({ to, name, date, phone, message }) {
        const meetingFormUrl = `${process.env.FRONTEND_URL || 'https://qbsecuriegnty.com'}/meeting-details?email=${encodeURIComponent(to)}`;
        
        const mailOptions = {
            to,
            subject: '✅ Appointment Confirmed | QB Securiegnty',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; overflow: hidden;">
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; text-align: center; backdrop-filter: blur(10px);">
                        <h1 style="color: white; font-size: 2em; margin: 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);">✅ APPOINTMENT CONFIRMED</h1>
                        <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.1em; margin: 10px 0;">QB Securiegnty</p>
                    </div>
                    <div style="background: white; padding: 30px;">
                        <h2 style="color: #333; margin-top: 0;">Hello ${name},</h2>
                        <p style="color: #555; line-height: 1.6;">Thank you for choosing QB Securiegnty. Your appointment has been confirmed!</p>
                        
                        <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
                            <h3 style="color: #333; margin-top: 0;">📋 Appointment Details</h3>
                            <p style="margin: 8px 0; color: #555;"><strong>Name:</strong> ${name}</p>
                            <p style="margin: 8px 0; color: #555;"><strong>Email:</strong> ${to}</p>
                            ${phone ? `<p style="margin: 8px 0; color: #555;"><strong>Phone:</strong> ${phone}</p>` : ''}
                            ${date ? `<p style="margin: 8px 0; color: #555;"><strong>Preferred Date:</strong> ${date}</p>` : ''}
                            ${message ? `<p style="margin: 8px 0; color: #555;"><strong>Message:</strong> ${message}</p>` : ''}
                        </div>

                        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                            <p style="margin: 0; font-weight: bold;">🔗 Complete your meeting details:</p>
                            <a href="${meetingFormUrl}" style="color: white; text-decoration: underline;">Click here to provide additional details</a>
                        </div>

                        <p style="color: #555; line-height: 1.6;">We'll contact you soon to finalize the meeting details.</p>
                        <p style="color: #555; line-height: 1.6;"><strong>The QB Securiegnty Team</strong></p>
                        
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center;">
                            If you did not request this appointment, please contact us immediately.
                        </div>
                    </div>
                </div>
            `
        };

        return await this.sendEmail(mailOptions);
    }

    async sendWelcomeEmail(to, name, tempPassword = null) {
        const mailOptions = {
            to,
            subject: '🎉 Welcome to QB Securiegnty!',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; overflow: hidden;">
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; text-align: center; backdrop-filter: blur(10px);">
                        <h1 style="color: white; font-size: 2.5em; margin: 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);">🛡️ QB Securiegnty</h1>
                        <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.2em; margin: 10px 0;">Welcome to Ultra-Secure Platform</p>
                    </div>
                    <div style="background: white; padding: 30px;">
                        <h2 style="color: #333; margin-top: 0;">Welcome ${name}!</h2>
                        <p style="color: #555; line-height: 1.6;">Your account has been successfully created on QB Securiegnty.</p>
                        
                        ${tempPassword ? `
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px 0; border-radius: 10px;">
                            <h3 style="color: #856404; margin-top: 0;">🔑 Temporary Login Credentials</h3>
                            <p style="color: #856404; margin: 8px 0;"><strong>Email:</strong> ${to}</p>
                            <p style="color: #856404; margin: 8px 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                            <p style="color: #856404; margin: 8px 0; font-size: 14px;"><em>Please change your password after first login</em></p>
                        </div>
                        ` : ''}

                        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                            <p style="margin: 0; font-weight: bold;">🚀 Your ultra-secure journey starts now!</p>
                        </div>

                        <p style="color: #555; line-height: 1.6;">Thank you for joining our secure platform.</p>
                        <p style="color: #555; line-height: 1.6;"><strong>The QB Securiegnty Team</strong></p>
                        
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center;">
                            This email was sent because an account was created with this email address.
                        </div>
                    </div>
                </div>
            `
        };

        return await this.sendEmail(mailOptions);
    }

    async sendVerificationEmail(to, name, verificationToken) {
        const verifyUrl = `${process.env.FRONTEND_URL || 'https://qbsecuriegnty.com'}/verify-email?token=${verificationToken}`;

        const mailOptions = {
            to,
            subject: '✅ Verify your email | QB Securiegnty',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; overflow: hidden;">
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; text-align: center; backdrop-filter: blur(10px);">
                        <h1 style="color: white; font-size: 2.5em; margin: 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);">🛡️ QB Securiegnty</h1>
                        <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.2em; margin: 10px 0;">Verify your email address</p>
                    </div>
                    <div style="background: white; padding: 30px;">
                        <h2 style="color: #333; margin-top: 0;">Hi ${name || 'there'},</h2>
                        <p style="color: #555; line-height: 1.6;">Thanks for signing up! Please verify your email address to activate your account.</p>

                        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-weight: bold;">🔗 Click below to verify your email:</p>
                            <a href="${verifyUrl}" style="color: white; text-decoration: underline; font-size: 16px;">Verify my email address</a>
                        </div>

                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
                            <p style="color: #856404; margin: 0; font-size: 14px;">⏰ This link expires in 24 hours.</p>
                        </div>

                        <p style="color: #555; line-height: 1.6;">If you did not create an account, you can safely ignore this email.</p>
                        <p style="color: #555; line-height: 1.6;"><strong>The QB Securiegnty Team</strong></p>
                    </div>
                </div>
            `
        };

        return await this.sendEmail(mailOptions);
    }

    async sendPasswordResetEmail(to, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL || 'https://qbsecuriegnty.com'}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            to,
            subject: '🔒 Password Reset Request | QB Securiegnty',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; overflow: hidden;">
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; text-align: center; backdrop-filter: blur(10px);">
                        <h1 style="color: white; font-size: 2em; margin: 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);">🔒 PASSWORD RESET</h1>
                        <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.1em; margin: 10px 0;">QB Securiegnty</p>
                    </div>
                    <div style="background: white; padding: 30px;">
                        <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
                        <p style="color: #555; line-height: 1.6;">We received a request to reset your password for your QB Securiegnty account.</p>
                        
                        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-weight: bold;">🔗 Reset your password:</p>
                            <a href="${resetUrl}" style="color: white; text-decoration: underline; font-size: 16px;">Click here to reset your password</a>
                        </div>

                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
                            <p style="color: #856404; margin: 0; font-size: 14px;">⏰ This link will expire in 1 hour for security reasons.</p>
                        </div>

                        <p style="color: #555; line-height: 1.6;">If you didn't request this password reset, please ignore this email.</p>
                        <p style="color: #555; line-height: 1.6;"><strong>The QB Securiegnty Team</strong></p>
                        
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center;">
                            For security reasons, never share this email or link with anyone.
                        </div>
                    </div>
                </div>
            `
        };

        return await this.sendEmail(mailOptions);
    }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;