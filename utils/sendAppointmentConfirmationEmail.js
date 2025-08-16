const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendAppointmentConfirmationEmail({ to, name, date, phone, message }) {
  const meetingFormUrl = `${process.env.FRONTEND_URL || 'https://qb-securiegnty.vercel.app'}/meeting-details?email=${encodeURIComponent(to)}`;
  const mailOptions = {
    from: `QB Securiegnty <${process.env.EMAIL_USER}>`,
    to,
    subject: '✅ Appointment Confirmed | QB Securiegnty',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmed - QB Securiegnty</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Orbitron', Arial, sans-serif; background: linear-gradient(135deg, #0a0a23, #23234f, #4a4a9c); padding: 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: rgba(255, 255, 255, 0.95); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7a7aff, #4a4a9c); padding: 24px; text-align: center;">
            <h1 style="font-family: 'Orbitron', Arial, sans-serif; color: white; font-size: 1.4rem; font-weight: 700; margin: 0; letter-spacing: 0.5px;">
              ✅ APPOINTMENT CONFIRMED
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); font-size: 0.85rem; margin: 6px 0 0 0; font-weight: 400;">
              Welcome, ${name}
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 24px;">
            <p style="color: #2d3748; font-size: 0.9rem; margin: 0 0 16px 0; line-height: 1.5;">
              Thank you for choosing QB Securiegnty. Your appointment details:
            </p>
            
            <!-- Details -->
            <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <div style="display: flex; margin-bottom: 8px;"><span style="color: #4a5568; font-weight: 600; width: 60px; font-size: 0.8rem;">Name:</span><span style="color: #2d3748; font-size: 0.8rem;">${name}</span></div>
              <div style="display: flex; margin-bottom: 8px;"><span style="color: #4a5568; font-weight: 600; width: 60px; font-size: 0.8rem;">Email:</span><span style="color: #2d3748; font-size: 0.8rem;">${to}</span></div>
              ${phone ? `<div style="display: flex; margin-bottom: 8px;"><span style="color: #4a5568; font-weight: 600; width: 60px; font-size: 0.8rem;">Phone:</span><span style="color: #2d3748; font-size: 0.8rem;">${phone}</span></div>` : ''}
              ${date ? `<div style="display: flex; margin-bottom: 8px;"><span style="color: #4a5568; font-weight: 600; width: 60px; font-size: 0.8rem;">Date:</span><span style="color: #2d3748; font-size: 0.8rem;">${date}</span></div>` : ''}
              ${message ? `<div style="margin-top: 12px;"><span style="color: #4a5568; font-weight: 600; font-size: 0.8rem; display: block; margin-bottom: 4px;">Message:</span><span style="color: #2d3748; font-size: 0.8rem; line-height: 1.4;">${message}</span></div>` : ''}
            </div>

            <!-- CTA -->
            <div style="background: linear-gradient(135deg, rgba(122, 122, 255, 0.1), rgba(74, 74, 156, 0.1)); border: 1px solid rgba(122, 122, 255, 0.2); border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
              <p style="color: #4a5568; font-size: 0.8rem; margin: 0 0 12px 0;">
                Next step: Schedule your meeting details
              </p>
              <a href="${meetingFormUrl}" style="display: inline-block; background: linear-gradient(135deg, #7a7aff, #4a4a9c); color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-family: 'Orbitron', Arial, sans-serif; font-weight: 600; font-size: 0.8rem; letter-spacing: 0.5px;">
                Schedule Meeting
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 0.75rem; margin: 0; font-family: 'Orbitron', Arial, sans-serif;">
              QB Securiegnty Team
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = sendAppointmentConfirmationEmail;
