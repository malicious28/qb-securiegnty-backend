// Password reset endpoints for authentication
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const router = express.Router();
const prisma = new PrismaClient();

// Configure nodemailer (example: Gmail, replace with your SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const { authenticateToken } = require('./routes.auth');
// Request password reset (public)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'No user found with that email.' });
    // Block Google-only accounts (dummy password is not a bcrypt hash)
    if (!user.password || (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$') && !user.password.startsWith('$2y$'))) {
      return res.status(400).json({ error: 'This account was created with Google. Please use Google login.' });
    }
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // Send email
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 15 minutes.</p>`
    });
    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Network error. Please try again later.' });
  }
});

// Reset password (public, uses reset token from body)
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  console.log('RESET PASSWORD BODY:', req.body);
  console.log('RESET PASSWORD TOKEN:', token);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('RESET PASSWORD PAYLOAD:', payload);
    const { password } = req.body;
    const finalPassword = newPassword || password;
    if (!finalPassword) {
      return res.status(400).json({ error: 'No password provided.' });
    }
    const hashedPassword = await bcrypt.hash(finalPassword, 12);
    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashedPassword },
    });
    res.json({ message: 'Password has been reset.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
});

module.exports = router;
