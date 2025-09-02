

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

console.log('🚀 Initializing backend...');

// Super simple and fast CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://qb-securiegnty.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Minimal security
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(express.json());
app.use(morgan('tiny')); // Faster logging

console.log('✅ Middleware configured');

// Load routes
console.log('📁 Loading routes...');
const { router: authRouter } = require('./routes.auth');
app.use('/api/auth', authRouter);
app.use('/api/auth', require('./routes.reset'));
app.use('/api/profile', require('./routes.profile'));
app.use('/api/appointments', require('./routes.appointment'));
app.use('/api/meeting-details', require('./routes.meetingdetails'));
app.use('/api/early-access', require('./routes.earlyaccess'));

console.log('✅ Routes loaded');

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend is running (all routes enabled)',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

console.log('✅ Backend initialization complete');

module.exports = app;
