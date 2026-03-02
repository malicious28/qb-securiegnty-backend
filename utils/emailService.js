const { Resend } = require('resend');

class EmailService {
    constructor() {
        this.resend = null;
        this.isConfigured = false;
        this.setupResend();
    }

    setupResend() {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.log('⚠️ RESEND_API_KEY not found — email service disabled');
                return;
            }
            this.resend = new Resend(process.env.RESEND_API_KEY);
            this.isConfigured = true;
            console.log('✅ Resend email service configured');
        } catch (error) {
            console.error('❌ Resend setup failed:', error.message);
            this.isConfigured = false;
        }
    }

    async testConnection() {
        if (!this.resend) {
            console.log('⚠️ Resend not configured');
            return false;
        }
        console.log('✅ Resend email service ready');
        return true;
    }

    async sendEmail(mailOptions) {
        if (!this.isConfigured || !this.resend) {
            throw new Error('Email service not available');
        }

        const senderEmail = process.env.SENDER_EMAIL || 'admin@qbsecuriegnty.com';
        const fromAddress = `QB Securiegnty <${senderEmail}>`;

        try {
            const result = await this.resend.emails.send({
                from: fromAddress,
                to: mailOptions.to,
                subject: mailOptions.subject,
                html: mailOptions.html
            });
            console.log(`📧 Email sent to ${mailOptions.to}: ${result.data?.id || 'ok'}`);
            return result;
        } catch (error) {
            // Fallback to resend.dev sender if custom domain not verified
            if (error.message.includes('domain') || error.message.includes('verify')) {
                const result = await this.resend.emails.send({
                    from: 'QB Securiegnty <onboarding@resend.dev>',
                    to: mailOptions.to,
                    subject: mailOptions.subject,
                    html: mailOptions.html
                });
                console.log(`📧 Email sent via fallback to ${mailOptions.to}`);
                return result;
            }
            throw error;
        }
    }

    // ─── Shared layout wrapper ────────────────────────────────────────────────
    _wrap(content) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QB Securiegnty</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6c63ff 0%,#3b2fa0 100%);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,0.5);text-transform:uppercase;">QB Securiegnty</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Secure Intelligence Platform</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#13131a;padding:36px 40px;border-left:1px solid #1e1e2e;border-right:1px solid #1e1e2e;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d0d14;border:1px solid #1e1e2e;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#3d3d5c;">© ${new Date().getFullYear()} QB Securiegnty. All rights reserved.</p>
              <p style="margin:6px 0 0 0;font-size:11px;color:#2a2a40;">If you did not expect this email, you can safely ignore it.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    }

    // ─── Welcome email (sent on registration) ────────────────────────────────
    async sendWelcomeEmail(to, name) {
        const html = this._wrap(`
            <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#ffffff;">Welcome, ${name || 'there'}</h2>
            <p style="margin:0 0 24px 0;font-size:14px;color:#8888aa;line-height:1.6;">Your account has been created successfully. You're now part of the QB Securiegnty platform.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a28;border:1px solid #2a2a40;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 10px 0;font-size:12px;font-weight:700;letter-spacing:2px;color:#6c63ff;text-transform:uppercase;">Your account</p>
                  <p style="margin:0;font-size:14px;color:#ccccdd;"><strong style="color:#ffffff;">Email:</strong> ${to}</p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#5a5a7a;line-height:1.6;">You can now log in and access all platform features. Reach out if you need anything.</p>
            <p style="margin:16px 0 0 0;font-size:13px;color:#5a5a7a;">— The QB Securiegnty Team</p>
        `);

        return await this.sendEmail({
            to,
            subject: 'Welcome to QB Securiegnty',
            html
        });
    }

    // ─── Early access email ───────────────────────────────────────────────────
    async sendEarlyAccessEmail(to, name) {
        const html = this._wrap(`
            <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#ffffff;">You're on the list, ${name || 'there'}</h2>
            <p style="margin:0 0 24px 0;font-size:14px;color:#8888aa;line-height:1.6;">Thanks for signing up for early access to QB Securiegnty. We'll reach out as soon as a spot opens up.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a28;border:1px solid #2a2a40;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;letter-spacing:2px;color:#6c63ff;text-transform:uppercase;">What's next</p>
                  <p style="margin:0 0 6px 0;font-size:14px;color:#ccccdd;">→ You'll be notified when early access opens</p>
                  <p style="margin:0 0 6px 0;font-size:14px;color:#ccccdd;">→ Priority access before public launch</p>
                  <p style="margin:0;font-size:14px;color:#ccccdd;">→ Exclusive updates from our team</p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#5a5a7a;">— The QB Securiegnty Team</p>
        `);

        return await this.sendEmail({
            to,
            subject: 'Early Access Request Received — QB Securiegnty',
            html
        });
    }

    // ─── Appointment confirmation ─────────────────────────────────────────────
    async sendAppointmentConfirmationEmail({ to, name, date, phone, message }) {
        const detailRows = [
            { label: 'Name', value: name },
            { label: 'Email', value: to },
            phone ? { label: 'Phone', value: phone } : null,
            date ? { label: 'Preferred Date', value: new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) } : null,
            message ? { label: 'Message', value: message } : null,
        ].filter(Boolean);

        const rows = detailRows.map(r =>
            `<tr><td style="padding:8px 0;font-size:13px;color:#5a5a7a;width:110px;vertical-align:top;">${r.label}</td><td style="padding:8px 0;font-size:13px;color:#ccccdd;">${r.value}</td></tr>`
        ).join('');

        const html = this._wrap(`
            <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#ffffff;">Appointment Confirmed</h2>
            <p style="margin:0 0 24px 0;font-size:14px;color:#8888aa;line-height:1.6;">We've received your appointment request. Our team will follow up shortly to confirm the details.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a28;border:1px solid #2a2a40;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 14px 0;font-size:12px;font-weight:700;letter-spacing:2px;color:#6c63ff;text-transform:uppercase;">Appointment Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#5a5a7a;">— The QB Securiegnty Team</p>
        `);

        return await this.sendEmail({
            to,
            subject: 'Appointment Confirmed — QB Securiegnty',
            html
        });
    }

    // ─── Password reset ───────────────────────────────────────────────────────
    async sendPasswordResetEmail(to, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL || 'https://qbsecuriegnty.com'}/reset-password?token=${resetToken}`;

        const html = this._wrap(`
            <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#ffffff;">Reset your password</h2>
            <p style="margin:0 0 24px 0;font-size:14px;color:#8888aa;line-height:1.6;">We received a request to reset the password for your QB Securiegnty account. Click the button below to set a new password.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="${resetUrl}"
                     style="display:inline-block;background:linear-gradient(135deg,#6c63ff,#3b2fa0);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:7px;letter-spacing:0.3px;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a28;border:1px solid #2a2a40;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 24px;">
                  <p style="margin:0;font-size:12px;color:#5a5a7a;line-height:1.6;">This link expires in <strong style="color:#8888aa;">1 hour</strong>. If you didn't request a password reset, you can ignore this email — your password will not change.</p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#3d3d5c;word-break:break-all;">Or copy this URL: ${resetUrl}</p>
        `);

        return await this.sendEmail({
            to,
            subject: 'Password Reset Request — QB Securiegnty',
            html
        });
    }
}

// Singleton instance
const emailService = new EmailService();

module.exports = emailService;
