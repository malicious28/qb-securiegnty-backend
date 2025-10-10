const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
        this.setupTransporter();
    }

    setupTransporter() {
        try {
            // Check if email credentials are available
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.log('⚠️ Email credentials not found in environment variables');
                return;
            }

            // Create transporter with multiple fallback options
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                tls: {
                    rejectUnauthorized: false
                },
                timeout: 10000, // 10 seconds timeout
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 10000
            });

            this.isConfigured = true;
            console.log('✅ Email service configured successfully');
            
            // Test the connection
            this.testConnection();
        } catch (error) {
            console.error('❌ Email service configuration failed:', error.message);
            this.isConfigured = false;
        }
    }

    async testConnection() {
        if (!this.transporter) {
            console.log('⚠️ Email transporter not configured');
            return false;
        }

        try {
            await this.transporter.verify();
            console.log('✅ Email connection verified successfully');
            return true;
        } catch (error) {
            console.error('❌ Email connection test failed:', error.message);
            console.error('💡 Check your EMAIL_USER and EMAIL_PASS in .env file');
            console.error('💡 Make sure you are using an App Password for Gmail');
            this.isConfigured = false;
            return false;
        }
    }

    async sendEmail(mailOptions) {
        if (!this.isConfigured || !this.transporter) {
            console.error('❌ Email service not configured');
            throw new Error('Email service not available');
        }

        try {
            console.log(`📧 Sending email to: ${mailOptions.to}`);
            const result = await this.transporter.sendMail({
                from: `QB Securiegnty <${process.env.EMAIL_USER}>`,
                ...mailOptions
            });
            console.log('✅ Email sent successfully:', result.messageId);
            return result;
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
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

    async sendMeetingDetailsConfirmationEmail({ to, name, meetingDate, meetingTime, duration, location, agenda, company, position }) {
        if (!this.isConfigured) {
            throw new Error('Email service not configured');
        }

        const formattedDate = meetingDate ? new Date(meetingDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'To be scheduled';

        const mailOptions = {
            from: `QB Securiegnty <${process.env.EMAIL_USER}>`,
            to: to,
            subject: '📅 Meeting Details Confirmed - QB Securiegnty',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; font-size: 28px;">Meeting Details Confirmed</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">QB Securiegnty</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                            Hello <strong>${name}</strong>,
                        </p>
                        
                        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                            Your meeting details have been successfully confirmed. Here are the details:
                        </p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                            <h3 style="color: #667eea; margin-top: 0;">Meeting Information</h3>
                            <p><strong>Date:</strong> ${formattedDate}</p>
                            ${meetingTime ? `<p><strong>Time:</strong> ${meetingTime}</p>` : ''}
                            <p><strong>Duration:</strong> ${duration || '30 minutes'}</p>
                            <p><strong>Location:</strong> ${location || 'Virtual'}</p>
                            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
                            ${position ? `<p><strong>Position:</strong> ${position}</p>` : ''}
                            ${agenda ? `<p><strong>Agenda:</strong> ${agenda}</p>` : ''}
                        </div>
                        
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #1976d2; font-size: 14px;">
                                <strong>📞 What's Next?</strong><br>
                                We'll send you meeting details and connection information closer to the scheduled date.
                                If you need to make any changes, please contact us as soon as possible.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL}" 
                               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                                Visit Dashboard
                            </a>
                        </div>
                        
                        <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
                            <p>This email was sent by QB Securiegnty</p>
                            <p>If you didn't request this meeting confirmation, please contact us immediately.</p>
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
