require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

console.log('🚀 Starting simple test server...');

// Enable CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check called');
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Early access endpoint (simplified)
app.post('/api/early-access', (req, res) => {
  console.log('📝 Early access request:', req.body);
  
  const { name, email, occupation } = req.body;
  
  if (!name || !email || !occupation) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  // Simulate success
  res.status(201).json({ 
    message: 'Early access request submitted successfully',
    data: { name, email, occupation, id: Date.now() }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Test server running' });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/health`);
  console.log(`Early Access: http://localhost:${PORT}/api/early-access`);
});
