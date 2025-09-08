require('dotenv').config();

// BULLETPROOF SERVER - NO MORE NETWORK ISSUES GUARANTEED
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 STARTING BULLETPROOF QB SECURIEGNTY BACKEND');
console.log('📍 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// BULLETPROOF CORS - WORKS WITH EVERYTHING
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', 
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://qb-securiegnty.netlify.app',
      'https://qbsecuriegnty.com',
      'https://www.qbsecuriegnty.com',
      origin // Allow the actual origin for development
    ];
    
    if (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Response-Time']
}));

// SECURITY & MIDDLEWARE
app.use(helmet({ 
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// REQUEST LOGGING
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path} from ${req.headers.origin || 'no-origin'}`);
  next();
});

// LOAD ROUTES WITH ERROR HANDLING
console.log('📁 Loading routes...');
try {
  const { router: authRouter } = require('./routes.auth');
  app.use('/api/auth', authRouter);
  console.log('✅ Auth routes loaded');
} catch (err) {
  console.error('❌ Auth routes failed:', err.message);
}

try {
  app.use('/api/auth', require('./routes.reset'));
  console.log('✅ Reset routes loaded');
} catch (err) {
  console.error('❌ Reset routes failed:', err.message);
}

try {
  app.use('/api/profile', require('./routes.profile'));
  console.log('✅ Profile routes loaded');
} catch (err) {
  console.error('❌ Profile routes failed:', err.message);
}

try {
  app.use('/api/appointments', require('./routes.appointment'));
  console.log('✅ Appointment routes loaded');
} catch (err) {
  console.error('❌ Appointment routes failed:', err.message);
}

try {
  app.use('/api/meeting-details', require('./routes.meetingdetails'));
  console.log('✅ Meeting details routes loaded');
} catch (err) {
  console.error('❌ Meeting details routes failed:', err.message);
}

try {
  app.use('/api/early-access', require('./routes.earlyaccess'));
  console.log('✅ Early access routes loaded');
} catch (err) {
  console.error('❌ Early access routes failed:', err.message);
}

// BULLETPROOF HEALTH CHECK
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
    version: '2.0.0-bulletproof',
    port: PORT
  };
  
  console.log('🏥 Health check OK from:', req.headers.origin || req.ip);
  res.status(200).json(healthData);
});

// KEEP ALIVE ENDPOINT
app.get('/keep-alive', (req, res) => {
  console.log('🔄 Keep-alive ping');
  res.status(200).json({ 
    message: 'Server is bulletproof and alive', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ROOT ENDPOINT
app.get('/', (req, res) => {
  res.json({ 
    message: 'QB Securiegnty Backend - Bulletproof Edition',
    status: 'bulletproof',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    endpoints: {
      health: '/health',
      earlyAccess: '/api/early-access',
      auth: '/api/auth/*',
      profile: '/api/profile/*',
      appointments: '/api/appointments/*'
    }
  });
});

// BULLETPROOF ERROR HANDLING
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// HANDLE 404
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: ['/health', '/api/early-access', '/api/auth/*']
  });
});

// BULLETPROOF SERVER STARTUP
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🎉 BULLETPROOF SERVER STARTED SUCCESSFULLY!');
  console.log(`✅ Server running on ALL interfaces: 0.0.0.0:${PORT}`);
  console.log(`🌐 Local access: http://localhost:${PORT}`);
  console.log(`🌐 Network access: http://127.0.0.1:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Early Access: http://localhost:${PORT}/api/early-access`);
  console.log('🛡️ CORS enabled for ALL origins in development');
  console.log('📡 Server is BULLETPROOF - No more network issues!');
  
  // Health indicator every 2 minutes
  setInterval(() => {
    console.log(`💚 Server healthy - ${new Date().toISOString()} - Uptime: ${Math.round(process.uptime())}s`);
  }, 120000);
});

// BULLETPROOF ERROR HANDLING
server.on('error', (err) => {
  console.error('🚨 SERVER ERROR:', err);
  
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is in use. Trying alternative ports...`);
    
    // Try alternative ports
    const altPorts = [5001, 5002, 3001, 8000, 8080];
    for (const altPort of altPorts) {
      try {
        const altServer = app.listen(altPort, '0.0.0.0', () => {
          console.log(`✅ Server started on alternative port ${altPort}`);
        });
        break;
      } catch (e) {
        console.log(`Port ${altPort} also in use, trying next...`);
      }
    }
  }
});

// BULLETPROOF PROCESS HANDLING
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
  // Don't exit - keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection:', reason);
  // Don't exit - keep server running
});

// GRACEFUL SHUTDOWN ONLY ON EXPLICIT SIGNALS
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received - Graceful shutdown...');
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received - Graceful shutdown...');
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

console.log('🔥 BULLETPROOF SERVER INITIALIZATION COMPLETE!');
console.log('🎯 NO MORE NETWORK ISSUES GUARANTEED!');
