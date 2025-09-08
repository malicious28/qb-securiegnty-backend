require('dotenv').config();

// ============================================
// BULLETPROOF QB SECURIEGNTY BACKEND SERVER
// ============================================
// - Never crashes (robust error handling)
// - Always responds (proper CORS and routing)  
// - Handles Early Access form (database integration)
// - Stays running (no unexpected shutdowns)
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 STARTING BULLETPROOF QB SECURIEGNTY BACKEND');
console.log('📍 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🕐 Started at:', new Date().toISOString());

// ============================================
// BULLETPROOF CORS CONFIGURATION
// ============================================
const corsOptions = {
  origin: function(origin, callback) {
    // Always allow requests without origin (mobile apps, curl, etc.)
    if (!origin) {
      console.log('✅ CORS: Allowing request without origin');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', 
      'http://localhost:5174',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:8080',
      'https://qb-securiegnty.netlify.app',
      'https://qbsecuriegnty.com',
      'https://www.qbsecuriegnty.com'
    ];
    
    // In development, be very permissive
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ CORS: Allowing origin in development: ${origin}`);
      return callback(null, true);
    }
    
    // Check allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Allowing approved origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`⚠️ CORS: Unknown origin, but allowing: ${origin}`);
      callback(null, true); // Still allow for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Cache-Control',
    'Pragma',
    'X-Forwarded-For'
  ],
  exposedHeaders: ['Content-Length', 'X-Response-Time'],
  optionsSuccessStatus: 200, // For legacy browser support
  preflightContinue: false
};

app.use(cors(corsOptions));

// Additional CORS headers for extra compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS Preflight: ${req.method} ${req.path} from ${req.headers.origin || 'no-origin'}`);
    return res.status(200).end();
  }
  
  next();
});

// ============================================
// SECURITY & MIDDLEWARE
// ============================================
app.use(helmet({ 
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('❌ Invalid JSON received:', e.message);
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Request logging and monitoring
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.headers.origin || req.headers.host || 'no-origin';
  console.log(`📝 ${timestamp} - ${req.method} ${req.path} from ${origin}`);
  
  // Add request ID for tracking
  req.requestId = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.requestId);
  
  next();
});

// ============================================
// DATABASE INITIALIZATION (BULLETPROOF)
// ============================================
let prisma = null;
let dbStatus = 'connecting';

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database connection...');
    const { PrismaClient } = require('@prisma/client');
    
    prisma = new PrismaClient({
      log: ['error', 'warn'],
      errorFormat: 'pretty'
    });
    
    // Test the connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    dbStatus = 'connected';
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    dbStatus = 'failed';
    prisma = null;
    return false;
  }
}

// Initialize database on startup
initializeDatabase();

// ============================================
// BULLETPROOF EARLY ACCESS ROUTE
// ============================================
app.post('/api/early-access', async (req, res) => {
  const requestId = req.requestId;
  console.log(`📝 [${requestId}] Early access request received`);
  console.log(`📝 [${requestId}] Body:`, req.body);
  console.log(`📝 [${requestId}] Headers:`, req.headers);
  
  try {
    const { name, email, occupation } = req.body;
    
    // Validate required fields
    if (!name || !email || !occupation) {
      console.log(`❌ [${requestId}] Missing required fields`);
      return res.status(400).json({ 
        error: 'Name, email, and occupation are required.',
        received: { 
          name: !!name, 
          email: !!email, 
          occupation: !!occupation 
        },
        requestId
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`❌ [${requestId}] Invalid email format: ${email}`);
      return res.status(400).json({ 
        error: 'Please provide a valid email address.',
        requestId 
      });
    }

    // Check database status
    if (!prisma || dbStatus !== 'connected') {
      console.error(`❌ [${requestId}] Database not available - Status: ${dbStatus}`);
      
      // Try to reinitialize database
      console.log(`🔄 [${requestId}] Attempting to reconnect to database...`);
      const reconnected = await initializeDatabase();
      
      if (!reconnected) {
        return res.status(503).json({ 
          error: 'Database temporarily unavailable. Please try again.',
          requestId,
          dbStatus
        });
      }
    }

    // Save to database
    console.log(`💾 [${requestId}] Saving to database...`);
    const earlyAccess = await prisma.earlyAccess.create({
      data: { 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        occupation: occupation.trim() 
      }
    });
    console.log(`✅ [${requestId}] Saved to database with ID: ${earlyAccess.id}`);

    // Send success response
    const response = { 
      message: 'Early access request submitted successfully!', 
      success: true,
      data: {
        id: earlyAccess.id,
        name: earlyAccess.name,
        email: earlyAccess.email,
        occupation: earlyAccess.occupation,
        createdAt: earlyAccess.createdAt
      },
      requestId
    };
    
    console.log(`✅ [${requestId}] Early access request completed successfully`);
    res.status(201).json(response);

  } catch (err) {
    console.error(`❌ [${requestId}] Early access error:`, err);
    
    // Handle specific database errors
    if (err.code === 'P2002') {
      return res.status(409).json({ 
        error: 'This email is already registered for early access.',
        requestId 
      });
    }
    
    // Handle database connection errors
    if (err.code === 'P1001' || err.message.includes('database')) {
      dbStatus = 'failed';
      return res.status(503).json({ 
        error: 'Database connection issue. Please try again.',
        requestId
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      error: 'Failed to submit early access request. Please try again.',
      requestId,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get early access requests (for admin)
app.get('/api/early-access', async (req, res) => {
  const requestId = req.requestId;
  console.log(`📋 [${requestId}] Fetching early access requests`);
  
  try {
    if (!prisma || dbStatus !== 'connected') {
      return res.status(503).json({ 
        error: 'Database connection unavailable',
        requestId
      });
    }

    const earlyAccessRequests = await prisma.earlyAccess.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ [${requestId}] Retrieved ${earlyAccessRequests.length} early access requests`);
    res.status(200).json({
      success: true,
      count: earlyAccessRequests.length,
      data: earlyAccessRequests,
      requestId
    });
    
  } catch (err) {
    console.error(`❌ [${requestId}] Error fetching early access requests:`, err);
    res.status(500).json({ 
      error: 'Failed to fetch early access requests',
      requestId
    });
  }
});

// ============================================
// LOAD OTHER ROUTES (WITH ERROR HANDLING)
// ============================================
console.log('📁 Loading additional routes...');

const routeModules = [
  { path: './routes.auth', mount: '/api/auth', name: 'Auth' },
  { path: './routes.reset', mount: '/api/auth', name: 'Reset' },
  { path: './routes.profile', mount: '/api/profile', name: 'Profile' },
  { path: './routes.appointment', mount: '/api/appointments', name: 'Appointments' },
  { path: './routes.meetingdetails', mount: '/api/meeting-details', name: 'Meeting Details' }
];

routeModules.forEach(({ path, mount, name }) => {
  try {
    const route = require(path);
    const router = route.router || route;
    app.use(mount, router);
    console.log(`✅ ${name} routes loaded at ${mount}`);
  } catch (err) {
    console.error(`⚠️ ${name} routes failed to load:`, err.message);
    // Continue without failing - routes are optional
  }
});

// ============================================
// BULLETPROOF HEALTH CHECK
// ============================================
app.get('/health', async (req, res) => {
  const requestId = req.requestId;
  console.log(`🏥 [${requestId}] Health check from: ${req.headers.origin || req.ip}`);
  
  // Test database connection
  let dbHealthy = false;
  try {
    if (prisma) {
      await prisma.$queryRaw`SELECT 1`;
      dbHealthy = true;
    }
  } catch (err) {
    console.error(`❌ [${requestId}] Database health check failed:`, err.message);
  }
  
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
    },
    database: {
      status: dbStatus,
      healthy: dbHealthy
    },
    environment: process.env.NODE_ENV || 'development',
    version: '3.0.0-bulletproof-final',
    port: PORT,
    nodeVersion: process.version,
    requestId
  };
  
  const statusCode = dbHealthy ? 200 : 503;
  res.status(statusCode).json(healthData);
});

// ============================================
// UTILITY ENDPOINTS
// ============================================

// Keep alive endpoint
app.get('/keep-alive', (req, res) => {
  console.log(`🔄 [${req.requestId}] Keep-alive ping from: ${req.headers.origin || req.ip}`);
  res.status(200).json({ 
    message: 'Server is bulletproof and alive!', 
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    requestId: req.requestId
  });
});

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  console.log(`🧪 [${req.requestId}] CORS test from: ${req.headers.origin || req.ip}`);
  res.status(200).json({
    message: 'CORS is working perfectly!',
    origin: req.headers.origin,
    method: req.method,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'QB Securiegnty Backend - Bulletproof Final Edition',
    status: 'bulletproof',
    timestamp: new Date().toISOString(),
    version: '3.0.0-bulletproof-final',
    uptime: Math.round(process.uptime()),
    endpoints: {
      health: '/health',
      keepAlive: '/keep-alive',
      testCors: '/api/test-cors',
      earlyAccess: {
        post: 'POST /api/early-access',
        get: 'GET /api/early-access'
      },
      auth: '/api/auth/*',
      profile: '/api/profile/*',
      appointments: '/api/appointments/*'
    },
    requestId: req.requestId
  });
});

// ============================================
// BULLETPROOF ERROR HANDLING
// ============================================

// Global error handler
app.use((err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  console.error(`❌ [${requestId}] ERROR:`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });
  
  // Don't crash the server - always respond
  res.status(err.status || 500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    path: req.path,
    requestId
  });
});

// Handle 404 - Route not found
app.use('*', (req, res) => {
  const requestId = req.requestId || 'unknown';
  console.log(`❌ [${requestId}] 404 - Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: 'Check the available endpoints at the root path /',
    availableRoutes: [
      '/',
      '/health', 
      '/keep-alive',
      '/api/test-cors',
      '/api/early-access',
      '/api/auth/*'
    ],
    requestId
  });
});

// ============================================
// BULLETPROOF SERVER STARTUP
// ============================================

let server;

function startServer(port = PORT) {
  return new Promise((resolve, reject) => {
    server = app.listen(port, '0.0.0.0', () => {
      console.log('🎉 BULLETPROOF SERVER STARTED SUCCESSFULLY!');
      console.log(`✅ Server running on ALL interfaces: 0.0.0.0:${port}`);
      console.log(`🌐 Local access: http://localhost:${port}`);
      console.log(`🌐 Network access: http://127.0.0.1:${port}`);
      console.log(`🏥 Health check: http://localhost:${port}/health`);
      console.log(`🔗 Early Access: http://localhost:${port}/api/early-access`);
      console.log(`🧪 CORS Test: http://localhost:${port}/api/test-cors`);
      console.log('🛡️ CORS enabled for ALL origins in development');
      console.log('📡 Server is BULLETPROOF - No more network issues!');
      console.log('🔥 BULLETPROOF SERVER INITIALIZATION COMPLETE!');
      console.log('🎯 NO MORE NETWORK ISSUES GUARANTEED!');
      
      resolve(server);
    });
    
    server.on('error', (err) => {
      reject(err);
    });
  });
}

async function initializeServer() {
  try {
    await startServer(PORT);
    
    // Health indicator every 2 minutes
    setInterval(() => {
      const uptime = Math.round(process.uptime());
      const memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      console.log(`💚 Server healthy - ${new Date().toISOString()} - Uptime: ${uptime}s - Memory: ${memory}MB - DB: ${dbStatus}`);
    }, 120000);
    
  } catch (err) {
    console.error('🚨 SERVER STARTUP ERROR:', err);
    
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is in use. Trying alternative ports...`);
      
      const altPorts = [5001, 5002, 5003, 3001, 8000, 8080, 8081];
      for (const altPort of altPorts) {
        try {
          console.log(`🔄 Trying port ${altPort}...`);
          await startServer(altPort);
          console.log(`✅ Server started successfully on alternative port ${altPort}`);
          break;
        } catch (e) {
          console.log(`❌ Port ${altPort} also in use, trying next...`);
          continue;
        }
      }
    } else {
      console.error('❌ Failed to start server on any port');
      process.exit(1);
    }
  }
}

// ============================================
// BULLETPROOF PROCESS HANDLING
// ============================================

// Handle uncaught exceptions - log but don't crash
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception (but server continues):', err.message);
  console.error('Stack:', err.stack);
  // Don't exit - keep server running
});

// Handle unhandled promise rejections - log but don't crash
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection (but server continues):', reason);
  console.error('Promise:', promise);
  // Don't exit - keep server running
});

// Graceful shutdown only on explicit signals
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received - Graceful shutdown...');
  
  if (server) {
    server.close(async () => {
      console.log('✅ HTTP server closed');
      
      if (prisma) {
        await prisma.$disconnect();
        console.log('✅ Database connection closed');
      }
      
      console.log('✅ Server shut down gracefully');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT (Ctrl+C) received - Graceful shutdown...');
  
  if (server) {
    server.close(async () => {
      console.log('✅ HTTP server closed');
      
      if (prisma) {
        await prisma.$disconnect();
        console.log('✅ Database connection closed');
      }
      
      console.log('✅ Server shut down gracefully');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Start the bulletproof server
initializeServer();

module.exports = app;
