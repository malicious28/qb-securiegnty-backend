const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMeetingScheduledEmail({ to, date, time, whatsapp, message }) {
  const mailOptions = {
    from: `QB Securiegnty <${process.env.EMAIL_USER}>`,
    to,
    subject: '🚀 Meeting Scheduled | QB Securiegnty',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meeting Scheduled - QB Securiegnty</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Orbitron', Arial, sans-serif; background: linear-gradient(135deg, #0a0a23, #23234f, #4a4a9c); padding: 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: rgba(255, 255, 255, 0.95); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7a7aff, #4a4a9c); padding: 24px; text-align: center;">
            <h1 style="font-family: 'Orbitron', Arial, sans-serif; color: white; font-size: 1.4rem; font-weight: 700; margin: 0; letter-spacing: 0.5px;">
              🚀 MEETING CONFIRMED
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); font-size: 0.85rem; margin: 6px 0 0 0; font-weight: 400;">
              QB Securiegnty
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 24px;">
            <p style="color: #2d3748; font-size: 0.9rem; margin: 0 0 16px 0; line-height: 1.5;">
              Your cybersecurity consultation is scheduled. Here are the details:
            </p>
            
            <!-- Details -->
            <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
              ${date ? `<div style="display: flex; margin-bottom: 8px;"><span style="color: #4a5568; font-weight: 600; width: 80px; font-size: 0.8rem;">Date:</span><span style="color: #2d3748; font-size: 0.8rem;">${date}</span></div>` : ''}
              ${time ? `<div style="display: flex; margin-bottom: 8px;"><span style="color: #4a5568; font-weight: 600; width: 80px; font-size: 0.8rem;">Time:</span><span style="color: #2d3748; font-size: 0.8rem;">${time}</span></div>` : ''}
              <div style="display: flex; margin-bottom: 8px;"><span style="color: #4a5568; font-weight: 600; width: 80px; font-size: 0.8rem;">Email:</span><span style="color: #2d3748; font-size: 0.8rem;">${to}</span></div>
              ${whatsapp ? `<div style="display: flex; margin-bottom: 8px;"><span style="color: #4a5568; font-weight: 600; width: 80px; font-size: 0.8rem;">WhatsApp:</span><span style="color: #2d3748; font-size: 0.8rem;">${whatsapp}</span></div>` : ''}
              ${message ? `<div style="margin-top: 12px;"><span style="color: #4a5568; font-weight: 600; font-size: 0.8rem; display: block; margin-bottom: 4px;">Topic:</span><span style="color: #2d3748; font-size: 0.8rem; line-height: 1.4;">${message}</span></div>` : ''}
            </div>
            
            <p style="color: #4a5568; font-size: 0.85rem; margin: 16px 0 0 0; text-align: center;">
              We look forward to securing your digital assets.
            </p>
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

module.exports = sendMeetingScheduledEmail;
