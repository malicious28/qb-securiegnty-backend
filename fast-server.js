// Ultra-fast server for immediate testing
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Minimal CORS - no verification delays
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Quick test endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fast backend is running!', 
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Quick auth test (no database)
app.post('/api/auth/test', (req, res) => {
  console.log('Test auth request received:', req.body);
  res.json({ 
    success: true, 
    message: 'Auth endpoint reachable',
    receivedData: req.body
  });
});

const PORT = 5001; // Different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`🚀 Fast test server running on port ${PORT}`);
  console.log(`✅ Test URL: http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for: http://localhost:5173`);
});
