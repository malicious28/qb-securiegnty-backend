const nodemailer = require('nodemailer');

async function sendEarlyAccessEmail(to, name) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Welcome to Early Access – Privatea',
    html: `<div style="font-family:sans-serif;padding:24px;background:#f8f8ff;border-radius:12px;max-width:500px;margin:auto;">
      <h2 style="color:#7a7aff;">Hi ${name || 'there'},</h2>
      <p>Thank you for signing up for early access to <b>Privatea</b>!<br>
      We’re excited to have you on board. You’ll be among the first to know when we launch and get exclusive updates.</p>
      <p style="margin-top:24px;">Stay tuned!<br><b>The Privatea Team</b></p>
      <div style="margin-top:32px;font-size:12px;color:#888;">If you did not request early access, you can ignore this email.</div>
    </div>`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEarlyAccessEmail;
