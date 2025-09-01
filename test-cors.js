// Simple CORS test script
const express = require('express');
require('dotenv').config();

const app = require('./index');

// Test CORS with a simple endpoint
app.get('/test-cors', (req, res) => {
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`CORS test server running on port ${PORT}`);
  console.log('Frontend URL:', process.env.FRONTEND_URL);
  console.log('Test this endpoint from your frontend: GET /test-cors');
});
