require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

console.log('🚀 Starting optimized backend...');

// Ultra-fast CORS setup
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
    'https://qb-securiegnty.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Optimized backend running!', 
    timestamp: new Date().toISOString() 
  });
});

// Load routes only when needed (lazy loading)
app.use('/api/auth', (req, res, next) => {
  console.log('Loading auth routes...');
  const { router } = require('./routes.auth');
  router(req, res, next);
});

app.use('/api/auth', (req, res, next) => {
  const resetRouter = require('./routes.reset');
  resetRouter(req, res, next);
});

app.use('/api/profile', (req, res, next) => {
  const profileRouter = require('./routes.profile');
  profileRouter(req, res, next);
});

app.use('/api/appointments', (req, res, next) => {
  const appointmentRouter = require('./routes.appointment');
  appointmentRouter(req, res, next);
});

app.use('/api/meeting-details', (req, res, next) => {
  const meetingRouter = require('./routes.meetingdetails');
  meetingRouter(req, res, next);
});

app.use('/api/early-access', (req, res, next) => {
  const earlyAccessRouter = require('./routes.earlyaccess');
  earlyAccessRouter(req, res, next);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Optimized backend ready on port ${PORT}`);
});

module.exports = app;
