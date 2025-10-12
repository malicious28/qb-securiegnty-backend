// HARDENED MEETING DETAILS ROUTES - ENTERPRISE SECURITY
const express = require('express');
const { getPrismaClient } = require('./utils/prisma');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const router = express.Router();
const prisma = getPrismaClient();

// Rate limit meeting details submissions
const meetingDetailsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 submissions per hour per IP
  message: {
    error: 'Meeting details submission limit exceeded. Please try again later.',
    retryAfter: '1 hour'
  },
  keyGenerator: (req) => `meetingdetails_${req.ip}`
});

// Input validation
const meetingDetailsValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail().customSanitizer(xss),
  body('date').isLength({ min: 1 }).withMessage('Date required').customSanitizer(xss),
  body('time').isLength({ min: 1 }).withMessage('Time required').customSanitizer(xss),
  body('whatsappNumber').optional().isLength({ min: 1 }).customSanitizer(xss),
  body('problem').optional().isLength({ min: 1 }).customSanitizer(xss)
];

// POST /api/meeting-details/confirm
router.post('/confirm', meetingDetailsLimiter, meetingDetailsValidation, async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array(), requestId });
    }
    const { email, date, time, whatsappNumber, problem } = req.body;
    // Save meeting details to DB (table: meetingDetails)
    const meeting = await prisma.meetingDetails.create({
      data: {
        email,
        date,
        time,
        whatsappNumber,
        problem
      }
    });

    // Send confirmation email to user
    try {
      const emailService = require('./utils/emailService');
      await emailService.sendAppointmentConfirmationEmail({
        to: email,
        name: email, // You can pass name if available
        date,
        phone: whatsappNumber,
        message: problem
      });
      console.log(`📧 Meeting details confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error(`⚠️ EMAIL: Failed to send meeting details confirmation to ${email}:`, emailError.message);
      // Don't fail the response if email fails
    }

    res.status(201).json({ message: 'Meeting details submitted successfully!', meeting, requestId });
  } catch (error) {
    console.error(`❌ Meeting details error for request ${requestId}:`, error);
    res.status(500).json({ error: 'Unable to submit meeting details. Please try again later.', requestId });
  }
});

module.exports = router;
