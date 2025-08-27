

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: [
    'https://qbsecuriegnty.com', // your frontend
    'https://qb-securiegnty-backend-production.up.railway.app', // your backend
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
}));
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
