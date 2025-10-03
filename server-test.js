// Minimal test server to debug deployment issues
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting minimal test server...');
console.log('📍 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// Basic middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0-test',
    message: 'Minimal server is working'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'QB Securiegnty Backend - Test Mode',
    status: 'working',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal test server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;