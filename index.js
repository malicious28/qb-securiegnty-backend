

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

console.log('🚀 Initializing backend...');

// Super simple and reliable CORS for your exact domains
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://qb-securiegnty.netlify.app',
    'https://qbsecuriegnty.com',
    'https://www.qbsecuriegnty.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Health check endpoint with enhanced monitoring
app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    environment: process.env.NODE_ENV || 'development',
    lastPing: new Date().toISOString()
  };
  
  console.log('🏥 Health check pinged:', req.headers.origin || 'no-origin');
  res.status(200).json(healthData);
});

// Keep-alive endpoint for self-pinging
app.get('/keep-alive', (req, res) => {
  console.log('🔄 Keep-alive ping received');
  res.status(200).json({ 
    message: 'Server is awake', 
    timestamp: new Date().toISOString() 
  });
});

// Main endpoint with enhanced info
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend is running (all routes enabled)',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    version: '1.0.0'
  });
});

// Enhanced error handling and logging
app.use((req, res, next) => {
  // Log all requests for debugging
  console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Handle 404 errors
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Backend initialization complete');

module.exports = app;
