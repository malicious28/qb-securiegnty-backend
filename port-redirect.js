const express = require('express');
const app = express();

// Redirect all requests to port 5001
app.use('*', (req, res) => {
  const newUrl = `http://localhost:5001${req.originalUrl}`;
  console.log(`🔄 Redirecting: ${req.originalUrl} → ${newUrl}`);
  res.redirect(301, newUrl);
});

app.listen(5000, () => {
  console.log('🔄 Port 5000 redirect server running → forwarding to 5001');
});