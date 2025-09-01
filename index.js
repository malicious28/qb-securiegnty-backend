

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

// Simple, fast CORS - only allow your specific domains
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://qb-securiegnty.netlify.app'
  ],
  credentials: true
}));

// Minimal security
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(express.json());
app.use(morgan('combined'));


const { router: authRouter } = require('./routes.auth');
app.use('/api/auth', authRouter);


app.use('/api/auth', require('./routes.reset'));


app.use('/api/profile', require('./routes.profile'));


app.use('/api/appointments', require('./routes.appointment'));


app.use('/api/meeting-details', require('./routes.meetingdetails'));


app.use('/api/early-access', require('./routes.earlyaccess'));

// Minimal route for error isolation
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running (all routes enabled).' });
});

module.exports = app;
