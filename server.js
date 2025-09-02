require('dotenv').config();
const app = require('./index');

const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

console.log('🚀 Starting QB Securiegnty Backend...');
console.log('Environment:', IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT');

// Add error handling for server startup
const server = app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  
  // Start keep-alive only in production (Render/Railway)
  if (IS_PRODUCTION) {
    const KeepAliveService = require('./utils/keepalive');
    const backendUrl = process.env.BACKEND_URL || `https://qb-securiegnty-backend.onrender.com`;
    const keepAlive = new KeepAliveService(backendUrl);
    keepAlive.startKeepAlive();
    console.log('🔄 Keep-alive service enabled');
  }
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Graceful shutdown
const shutdown = () => {
  console.log('🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
