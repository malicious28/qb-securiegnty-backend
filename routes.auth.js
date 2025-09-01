// User authentication routes
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const nodemailer = require('nodemailer');

// Configure nodemailer (example: Gmail, replace with your SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// JWT authentication middleware (for protected routes)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Passport Google OAuth setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
    let isNew = false;
    if (!user) {
      // Auto-register Google users with a dummy password
      user = await prisma.user.create({
        data: {
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          email: profile.emails[0].value,
          password: Math.random().toString(36), // dummy password
          country: '',
          isVerified: true
        }
      });
      isNew = true;
      // Send welcome email to Google users
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: profile.emails[0].value,
          subject: 'Welcome to QB Securiegnty!',
          html: `<p>Hi ${profile.name?.givenName || ''},</p><p>Your account has been created using Google. Welcome to QB Securiegnty!</p>`
        });
      } catch (emailErr) {
        console.error('Failed to send welcome email to Google user:', emailErr);
      }
    } else {
      // Existing user: update a non-timestamp field to force updatedAt to change
      user = await prisma.user.update({
        where: { email: profile.emails[0].value },
        data: { country: user.country || '' } // triggers @updatedAt
      });
    }
    // Attach _isNew property for downstream detection
    user._isNew = isNew;
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
  try {
    if (!req.user) {
      const errorMsg = encodeURIComponent('No account exists with this email. Please create a new account.');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-callback?google=success&type=noaccount&error=${errorMsg}`);
    }
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Robust check: if createdAt and updatedAt are within 5 seconds, treat as new user
    const createdAt = new Date(req.user.createdAt);
    const updatedAt = new Date(req.user.updatedAt || req.user.createdAt);
    const isNew = Math.abs(createdAt.getTime() - updatedAt.getTime()) < 5000;
    if (isNew) {
      // New Google signup: redirect to onboarding
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding?token=${token}`);
    } else {
      // Existing user: redirect to dashboard
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?token=${token}`);
    }
  } catch (err) {
    console.error('Google OAuth error:', err);
    const errorMsg = encodeURIComponent('Google login failed. Please try again or use email signup.');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-callback?error=${errorMsg}`);
  }
});

// Register
// Registration is disabled for security reasons
// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, country } = req.body;
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        country,
        isVerified: true
      }
    });
    // Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to QB Securiegnty!',
      html: `<p>Hi ${firstName},</p><p>Congratulations! You have been successfully registered at QB Securiegnty.</p><p>We're excited to have you on board.</p>`
    });
    res.status(201).json({ message: 'Account created successfully. Confirmation email sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Email format validation
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(400).json({ error: 'No account exists with this email. Please create a new account.' });
    // Block Google users (dummy password is not a bcrypt hash)
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$') && !user.password.startsWith('$2y$')) {
      return res.status(400).json({ error: 'This account was created with Google. Please use Google login.' });
    }
    if (!user.isVerified) return res.status(403).json({ error: 'Email not verified. Please check your inbox.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});
// Logout endpoint
router.post('/logout', (req, res) => {
  // In JWT systems, logout is handled client-side by removing the token.
  // This endpoint is for frontend to call and get a standard response.
  res.json({ message: 'Logged out successfully.' });
});

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'No token provided' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) return res.status(400).json({ error: 'Invalid token or user not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Email already verified' });
    await prisma.user.update({ where: { email: payload.email }, data: { isVerified: true, verificationToken: null } });
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// Example protected route (for testing JWT)
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'You are authenticated!', user: req.user });
});

module.exports = { router, authenticateToken };
