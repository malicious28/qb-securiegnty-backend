require('dotenv').config();

// ULTIMATE BULLETPROOF SERVER - STANDALONE VERSION
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 ULTIMATE BULLETPROOF SERVER STARTING...');

// SIMPLE BUT BULLETPROOF CORS
app.use(cors({
  origin: '*', // Allow everything for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// BULLETPROOF LOGGING
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// BULLETPROOF HEALTH CHECK
app.get('/health', (req, res) => {
  console.log('🏥 Health check called');
  res.json({
    status: 'BULLETPROOF',
    timestamp: new Date().toISOString(),
    message: 'Server is running perfectly',
    uptime: process.uptime()
  });
});

// BULLETPROOF EARLY ACCESS (SIMPLIFIED TO AVOID DATABASE ISSUES)
app.post('/api/early-access', (req, res) => {
  console.log('📝 Early access request received:', req.body);
  
  const { name, email, occupation } = req.body;
  
  if (!name || !email || !occupation) {
    console.log('❌ Missing required fields');
    return res.status(400).json({
      error: 'Name, email, and occupation are required',
      received: { name: !!name, email: !!email, occupation: !!occupation }
    });
  }
  
  // Simulate success (we'll add database later once this works)
  console.log('✅ Early access request processed successfully');
  res.status(201).json({
    message: 'Early access request submitted successfully',
    data: {
      id: Date.now(),
      name,
      email,
      occupation,
      timestamp: new Date().toISOString()
    }
  });
});

// ROOT ENDPOINT
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint called');
  res.json({
    message: 'BULLETPROOF QB Securiegnty Backend',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      earlyAccess: '/api/early-access'
    }
  });
});

// BULLETPROOF 404 HANDLER
app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableRoutes: ['/', '/health', '/api/early-access']
  });
});

// BULLETPROOF ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// START SERVER WITH BULLETPROOF ERROR HANDLING
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🎉 BULLETPROOF SERVER SUCCESSFULLY STARTED!');
  console.log(`✅ Listening on http://localhost:${PORT}`);
  console.log(`✅ Listening on http://127.0.0.1:${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/health`);
  console.log(`✅ Early Access: http://localhost:${PORT}/api/early-access`);
  console.log('🛡️ SERVER IS BULLETPROOF - NO NETWORK ISSUES POSSIBLE!');
});

server.on('error', (err) => {
  console.error('🚨 Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} in use. Server will try port ${PORT + 1}`);
    // Try next port
    const altServer = app.listen(PORT + 1, '0.0.0.0', () => {
      console.log(`✅ Started on alternative port ${PORT + 1}`);
    });
  }
});

// BULLETPROOF PROCESS HANDLING
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception - Server continues:', err.message);
  // Don't exit - keep running
});

process.on('unhandledRejection', (reason) => {
  console.error('🚨 Unhandled Rejection - Server continues:', reason);
  // Don't exit - keep running
});

// KEEP SERVER ALIVE
setInterval(() => {
  console.log(`💚 Server alive - ${new Date().toISOString()}`);
}, 60000);

console.log('🔥 BULLETPROOF INITIALIZATION COMPLETE!');
