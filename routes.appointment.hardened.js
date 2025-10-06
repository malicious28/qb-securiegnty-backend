// HARDENED APPOINTMENT ROUTES - ENTERPRISE SECURITY
const express = require('express');
const { getPrismaClient } = require('./utils/prisma');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const validator = require('validator');
const emailService = require('./utils/emailService');
const router = express.Router();
const prisma = getPrismaClient();

// Import hardened authentication
const { authenticateToken } = require('./routes.auth.hardened');

// ============================================
// RATE LIMITING FOR APPOINTMENTS
// ============================================

const appointmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 appointment bookings per hour per user
  message: {
    error: 'Appointment booking limit exceeded. Please try again later.',
    retryAfter: '1 hour'
  },
  keyGenerator: (req) => {
    // Rate limit by authenticated user ID + IP
    return `appointments_${req.user?.userId || 'anonymous'}_${req.ip}`;
  }
});

// ============================================
// COMPREHENSIVE INPUT VALIDATION
// ============================================

const appointmentValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s'-\.]+$/)
    .withMessage('Name can only contain letters, spaces, apostrophes, hyphens, and periods')
    .customSanitizer(value => xss(value)),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ min: 5, max: 254 })
    .withMessage('Email must be between 5 and 254 characters')
    .custom((email) => {
      if (!validator.isEmail(email)) {
        throw new Error('Invalid email format');
      }
      return true;
    }),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters')
    .matches(/^[+]?[\d\s\-\(\)\.]+$/)
    .withMessage('Phone number contains invalid characters')
    .customSanitizer(value => value ? xss(value) : value),

  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters')
    .customSanitizer(value => value ? xss(value) : value)
    .custom((value) => {
      if (value && /script|javascript|<|>|&lt;|&gt;/i.test(value)) {
        throw new Error('Message contains invalid characters');
      }
      return true;
    }),

  body('appointmentDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid appointment date format')
    .custom((value) => {
      if (value) {
        const appointmentDate = new Date(value);
        const now = new Date();
        
        // Can't book appointments in the past
        if (appointmentDate <= now) {
          throw new Error('Appointment date must be in the future');
        }
        
        // Can't book appointments more than 6 months in advance
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        if (appointmentDate > sixMonthsFromNow) {
          throw new Error('Appointment date cannot be more than 6 months in advance');
        }
      }
      return true;
    }),

  body('appointmentType')
    .optional()
    .isIn(['consultation', 'follow-up', 'emergency', 'general'])
    .withMessage('Invalid appointment type'),

  // Security: Reject any extra fields
  body().custom((value, { req }) => {
    const allowedFields = ['name', 'email', 'phone', 'message', 'appointmentDate', 'appointmentType'];
    const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
    if (extraFields.length > 0) {
      throw new Error(`Unauthorized fields detected: ${extraFields.join(', ')}`);
    }
    return true;
  })
];

// ============================================
// SECURE APPOINTMENT BOOKING ENDPOINT
// ============================================

router.post('/', 
  appointmentLimiter,
  authenticateToken, // Require authentication
  appointmentValidation,
  async (req, res) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(`❌ SECURITY: Appointment validation failed for request ${requestId}:`, errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
          requestId,
          code: 'VALIDATION_ERROR'
        });
      }

      const { name, email, phone, message, appointmentDate, appointmentType } = req.body;

      // Verify authenticated user
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { email: true, isVerified: true, firstName: true, lastName: true }
      });

      if (!user) {
        return res.status(404).json({
          error: 'User account not found',
          requestId,
          code: 'USER_NOT_FOUND'
        });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          error: 'Please verify your email address before booking appointments',
          requestId,
          code: 'EMAIL_NOT_VERIFIED'
        });
      }

      // Check for duplicate appointments (same user, same day)
      if (appointmentDate) {
        const appointmentDay = new Date(appointmentDate);
        appointmentDay.setHours(0, 0, 0, 0);
        const nextDay = new Date(appointmentDay);
        nextDay.setDate(nextDay.getDate() + 1);

        const existingAppointment = await prisma.appointment.findFirst({
          where: {
            email: email.toLowerCase(),
            createdAt: {
              gte: appointmentDay,
              lt: nextDay
            }
          }
        });

        if (existingAppointment) {
          return res.status(409).json({
            error: 'You already have an appointment booked for this date',
            requestId,
            code: 'DUPLICATE_APPOINTMENT'
          });
        }
      }

      // Sanitize and prepare appointment data
      const appointmentData = {
        name: xss(name.trim()),
        email: email.toLowerCase().trim(),
        phone: phone ? xss(phone.trim()) : null,
        message: message ? xss(message.trim()) : null,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : null,
        appointmentType: appointmentType || 'general',
        userId: req.user.userId // Link to authenticated user
      };

      console.log(`💾 SECURITY: Creating appointment ${requestId} for user ${user.email} from IP ${req.ip}`);

      const appointment = await prisma.appointment.create({
        data: appointmentData
      });

      console.log(`✅ SECURITY: Appointment ${requestId} created successfully with ID: ${appointment.id}`);

      // Security audit log
      console.log(`📊 AUDIT: Appointment booking - ID: ${appointment.id}, User: ${user.email}, IP: ${req.ip}, Type: ${appointmentType || 'general'}`);

      // Send confirmation email securely
      try {
        await emailService.sendAppointmentConfirmationEmail({
          to: email,
          name: name,
          date: appointmentDate,
          phone: phone,
          message: message
        });
        console.log(`📧 SECURITY: Appointment confirmation email sent to ${email} for appointment ${appointment.id}`);
      } catch (emailError) {
        console.error(`⚠️ EMAIL: Failed to send appointment confirmation to ${email}:`, emailError.message);
        // Don't fail the appointment creation if email fails
      }

      res.status(201).json({
        message: 'Appointment booked successfully!',
        appointment: {
          id: appointment.id,
          name: appointment.name,
          email: appointment.email,
          phone: appointment.phone,
          appointmentDate: appointment.appointmentDate,
          appointmentType: appointment.appointmentType,
          createdAt: appointment.createdAt
        },
        requestId,
        code: 'APPOINTMENT_SUCCESS'
      });

    } catch (error) {
      console.error(`❌ SECURITY: Appointment booking error for request ${requestId}:`, error);
      
      // Handle specific database errors
      if (error.code === 'P2002') {
        return res.status(409).json({
          error: 'A conflicting appointment already exists',
          requestId,
          code: 'APPOINTMENT_CONFLICT'
        });
      }

      res.status(500).json({
        error: 'Unable to book appointment at this time. Please try again later.',
        requestId,
        code: 'BOOKING_ERROR'
      });
    }
  }
);

// ============================================
// GET USER'S APPOINTMENTS (Authenticated)
// ============================================

router.get('/my-appointments', 
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 requests per 15 minutes
    keyGenerator: (req) => `my_appointments_${req.user?.userId || 'anonymous'}_${req.ip}`
  }),
  authenticateToken,
  async (req, res) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { email: true }
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          requestId,
          code: 'USER_NOT_FOUND'
        });
      }

      // Get appointments for this user
      const appointments = await prisma.appointment.findMany({
        where: {
          OR: [
            { userId: req.user.userId },
            { email: user.email }
          ]
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          message: true,
          appointmentDate: true,
          appointmentType: true,
          createdAt: true
        }
      });

      console.log(`✅ SECURITY: User ${user.email} accessed their appointments from IP ${req.ip}`);

      res.json({
        appointments,
        count: appointments.length,
        requestId,
        code: 'APPOINTMENTS_RETRIEVED'
      });

    } catch (error) {
      console.error(`❌ SECURITY: My appointments error for request ${requestId}:`, error);
      res.status(500).json({
        error: 'Unable to retrieve appointments',
        requestId,
        code: 'RETRIEVAL_ERROR'
      });
    }
  }
);

// ============================================
// CANCEL APPOINTMENT (Authenticated)
// ============================================

router.delete('/:appointmentId',
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 cancellations per hour
    keyGenerator: (req) => `cancel_appointment_${req.user?.userId || 'anonymous'}_${req.ip}`
  }),
  authenticateToken,
  async (req, res) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    const appointmentId = parseInt(req.params.appointmentId);
    
    try {
      if (isNaN(appointmentId)) {
        return res.status(400).json({
          error: 'Invalid appointment ID',
          requestId,
          code: 'INVALID_ID'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { email: true }
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          requestId,
          code: 'USER_NOT_FOUND'
        });
      }

      // Find appointment belonging to this user
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          OR: [
            { userId: req.user.userId },
            { email: user.email }
          ]
        }
      });

      if (!appointment) {
        return res.status(404).json({
          error: 'Appointment not found or you do not have permission to cancel it',
          requestId,
          code: 'APPOINTMENT_NOT_FOUND'
        });
      }

      // Delete the appointment
      await prisma.appointment.delete({
        where: { id: appointmentId }
      });

      console.log(`✅ SECURITY: User ${user.email} cancelled appointment ${appointmentId} from IP ${req.ip}`);

      res.json({
        message: 'Appointment cancelled successfully',
        appointmentId,
        requestId,
        code: 'APPOINTMENT_CANCELLED'
      });

    } catch (error) {
      console.error(`❌ SECURITY: Appointment cancellation error for request ${requestId}:`, error);
      res.status(500).json({
        error: 'Unable to cancel appointment',
        requestId,
        code: 'CANCELLATION_ERROR'
      });
    }
  }
);

module.exports = router;
