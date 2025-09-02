require('dotenv').config();
const app = require('./index');

const PORT = process.env.PORT || 5000;

// Add error handling for server startup
const server = app.listen(PORT, () => {
  console.log(`🚀 Secure backend running on port ${PORT}`);
  console.log(`✅ CORS configured for frontend: ${process.env.FRONTEND_URL}`);
  console.log(`✅ Server ready at http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});
