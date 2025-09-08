const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; // Different port

console.log('🚀 Starting backend on port', PORT);

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  console.log('🏥 Health check called');
  res.json({ status: 'OK', port: PORT });
});

// Early access route
app.post('/api/early-access', (req, res) => {
  console.log('📝 Early access POST received:', req.body);
  
  const { name, email, occupation } = req.body;
  
  if (!name || !email || !occupation) {
    console.log('❌ Missing fields');
    return res.status(400).json({ 
      error: 'Name, email, and occupation are required',
      received: { name, email, occupation }
    });
  }
  
  console.log('✅ Early access request valid');
  res.status(201).json({ 
    message: 'Early access request submitted successfully',
    data: { name, email, occupation, timestamp: new Date().toISOString() }
  });
});

// Options preflight for CORS
app.options('*', cors());

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running', port: PORT });
});

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Server running on http://127.0.0.1:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Keep server alive
setInterval(() => {
  console.log(`🔄 Server alive on port ${PORT}`, new Date().toISOString());
}, 30000);
