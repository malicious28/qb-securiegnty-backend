require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const prisma = require('@prisma/client');

const app = express();

const passport = require('passport');
const { router: authRouter } = require('./routes.auth');
// Security Middlewares
app.use(helmet());
app.use(cors({ 
  origin: [process.env.FRONTEND_URL, 'https://qb-securiegnty.netlify.app'], 
  credentials: true 
}));
app.use(express.json());
app.use(morgan('combined'));
app.use(passport.initialize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Auth routes
app.use('/api/auth', authRouter);
// Password reset routes
app.use('/api/auth', require('./routes.reset'));

// User profile routes
app.use('/api/profile', require('./routes.profile'));

// Book Appointment route
app.use('/api/appointments', require('./routes.appointment'));

// Meeting Details confirmation route (for sending meeting scheduled email)
app.use('/api/meeting-details', require('./routes.meetingdetails'));

// Early Access route
app.use('/api/early-access', require('./routes.earlyaccess'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running securely!' });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
