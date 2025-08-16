const express = require('express');
const router = express.Router();
const sendMeetingScheduledEmail = require('./utils/sendMeetingScheduledEmail');

// POST /api/meeting-details/confirm
router.post('/confirm', async (req, res) => {
  try {
    const { email, date, time, whatsapp, message } = req.body;
    if (!email || !date || !time) {
      return res.status(400).json({ error: 'Email, date, and time are required.' });
    }
    await sendMeetingScheduledEmail({ to: email, date, time, whatsapp, message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send meeting confirmation email.' });
  }
});

module.exports = router;
