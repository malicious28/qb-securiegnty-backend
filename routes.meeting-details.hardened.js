// HARDENED MEETING DETAILS ROUTES - ENTERPRISE SECURITY
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
// RATE LIMITING FOR MEETING DETAILS
// ============================================

const meetingDetailsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 meeting detail submissions per hour per user
  message: {
    error: 'Meeting details submission limit exceeded. Please try again later.',
    retryAfter: '1 hour'
  },
  keyGenerator: (req) => {
    // Rate limit by authenticated user ID + IP
    return `meeting_details_${req.user?.userId || 'anonymous'}_${req.ip}`;
  }
});

// ============================================
// COMPREHENSIVE INPUT VALIDATION
// ============================================

const meetingDetailsValidation = [
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

  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters')
    .customSanitizer(value => value ? xss(value) : value),

  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters')
    .customSanitizer(value => value ? xss(value) : value),

  body('meetingDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid meeting date format')
    .custom((value) => {
      if (value) {
        const meetingDate = new Date(value);
        const now = new Date();
        
        // Can't schedule meetings in the past
        if (meetingDate <= now) {
          throw new Error('Meeting date must be in the future');
        }
        
        // Can't schedule meetings more than 6 months in advance
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        if (meetingDate > sixMonthsFromNow) {
          throw new Error('Meeting date cannot be more than 6 months in advance');
        }
      }
      return true;
    }),

  body('meetingTime')
    .optional()
    .trim()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Meeting time must be in HH:MM format'),

  body('duration')
    .optional()
    .isIn(['15 minutes', '30 minutes', '45 minutes', '1 hour', '1.5 hours', '2 hours'])
    .withMessage('Invalid meeting duration'),

  body('location')
    .optional()
    .isIn(['virtual', 'office', 'client-site', 'other'])
    .withMessage('Invalid meeting location'),

  body('agenda')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Agenda cannot exceed 1000 characters')
    .customSanitizer(value => value ? xss(value) : value),

  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Requirements cannot exceed 500 characters')
    .customSanitizer(value => value ? xss(value) : value),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
    .customSanitizer(value => value ? xss(value) : value),

  body('appointmentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid appointment ID'),

  // Security: Reject any extra fields
  body().custom((value, { req }) => {
    const allowedFields = [
      'name', 'email', 'phone', 'company', 'position', 
      'meetingDate', 'meetingTime', 'duration', 'location', 
      'agenda', 'requirements', 'notes', 'appointmentId'
    ];
    const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
    if (extraFields.length > 0) {
      throw new Error(`Unauthorized fields detected: ${extraFields.join(', ')}`);
    }
    return true;
  })
];

// ============================================
// SECURE MEETING DETAILS CONFIRMATION ENDPOINT
// ============================================

router.post('/confirm', 
  meetingDetailsLimiter,
  authenticateToken, // Require authentication
  meetingDetailsValidation,
  async (req, res) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(`❌ SECURITY: Meeting details validation failed for request ${requestId}:`, errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
          requestId,
          code: 'VALIDATION_ERROR'
        });
      }

      const {
        name, email, phone, company, position,
        meetingDate, meetingTime, duration, location,
        agenda, requirements, notes, appointmentId
      } = req.body;

      // Verify authenticated user
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { email: true, isEmailVerified: true, firstName: true, lastName: true }
      });

      if (!user) {
        return res.status(404).json({
          error: 'User account not found',
          requestId,
          code: 'USER_NOT_FOUND'
        });
      }

      if (!user.isEmailVerified) {
        return res.status(403).json({
          error: 'Please verify your email address before confirming meeting details',
          requestId,
          code: 'EMAIL_NOT_VERIFIED'
        });
      }

      // Verify appointment exists if appointmentId provided
      let appointment = null;
      if (appointmentId) {
        appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId },
          include: { user: true }
        });

        if (!appointment) {
          return res.status(404).json({
            error: 'Appointment not found',
            requestId,
            code: 'APPOINTMENT_NOT_FOUND'
          });
        }

        // Check if user owns the appointment or is admin
        if (appointment.userId !== req.user.userId && appointment.email !== user.email) {
          return res.status(403).json({
            error: 'You do not have permission to access this appointment',
            requestId,
            code: 'APPOINTMENT_ACCESS_DENIED'
          });
        }

        // Check if meeting details already exist for this appointment
        const existingMeetingDetails = await prisma.meetingDetails.findUnique({
          where: { appointmentId }
        });

        if (existingMeetingDetails) {
          return res.status(409).json({
            error: 'Meeting details already exist for this appointment',
            requestId,
            code: 'MEETING_DETAILS_EXIST'
          });
        }
      }

      // Check for duplicate meeting details (same user, same day)
      if (meetingDate) {
        const meetingDay = new Date(meetingDate);
        meetingDay.setHours(0, 0, 0, 0);
        const nextDay = new Date(meetingDay);
        nextDay.setDate(nextDay.getDate() + 1);

        const existingMeeting = await prisma.meetingDetails.findFirst({
          where: {
            email: email.toLowerCase(),
            meetingDate: {
              gte: meetingDay,
              lt: nextDay
            }
          }
        });

        if (existingMeeting) {
          return res.status(409).json({
            error: 'You already have meeting details confirmed for this date',
            requestId,
            code: 'DUPLICATE_MEETING'
          });
        }
      }

      // Sanitize and prepare meeting details data
      const meetingDetailsData = {
        name: xss(name.trim()),
        email: email.toLowerCase().trim(),
        phone: phone ? xss(phone.trim()) : null,
        company: company ? xss(company.trim()) : null,
        position: position ? xss(position.trim()) : null,
        meetingDate: meetingDate ? new Date(meetingDate) : null,
        meetingTime: meetingTime ? meetingTime.trim() : null,
        duration: duration || '30 minutes',
        location: location || 'virtual',
        agenda: agenda ? xss(agenda.trim()) : null,
        requirements: requirements ? xss(requirements.trim()) : null,
        notes: notes ? xss(notes.trim()) : null,
        status: 'confirmed',
        userId: req.user.userId,
        appointmentId: appointmentId || null
      };

      console.log(`💾 SECURITY: Creating meeting details ${requestId} for user ${user.email} from IP ${req.ip}`);

      const meetingDetails = await prisma.meetingDetails.create({
        data: meetingDetailsData,
        include: {
          user: {
            select: { email: true, firstName: true, lastName: true }
          },
          appointment: {
            select: { id: true, appointmentType: true, createdAt: true }
          }
        }
      });

      console.log(`✅ SECURITY: Meeting details ${requestId} created successfully with ID: ${meetingDetails.id}`);

      // Security audit log
      console.log(`📊 AUDIT: Meeting details confirmation - ID: ${meetingDetails.id}, User: ${user.email}, IP: ${req.ip}, Date: ${meetingDate || 'N/A'}`);

      // Send confirmation email securely
      try {
        await emailService.sendMeetingDetailsConfirmationEmail({
          to: email,
          name: name,
          meetingDate: meetingDate,
          meetingTime: meetingTime,
          duration: duration,
          location: location,
          agenda: agenda,
          company: company,
          position: position
        });
        console.log(`📧 SECURITY: Meeting details confirmation email sent to ${email} for meeting ${meetingDetails.id}`);
      } catch (emailError) {
        console.error(`⚠️ EMAIL: Failed to send meeting details confirmation to ${email}:`, emailError.message);
        // Don't fail the meeting details creation if email fails
      }

      res.status(201).json({
        message: 'Meeting details confirmed successfully!',
        meetingDetails: {
          id: meetingDetails.id,
          name: meetingDetails.name,
          email: meetingDetails.email,
          phone: meetingDetails.phone,
          company: meetingDetails.company,
          position: meetingDetails.position,
          meetingDate: meetingDetails.meetingDate,
          meetingTime: meetingDetails.meetingTime,
          duration: meetingDetails.duration,
          location: meetingDetails.location,
          agenda: meetingDetails.agenda,
          status: meetingDetails.status,
          createdAt: meetingDetails.createdAt
        },
        requestId,
        code: 'MEETING_DETAILS_SUCCESS'
      });

    } catch (error) {
      console.error(`❌ SECURITY: Meeting details confirmation error for request ${requestId}:`, error);
      
      // Handle specific database errors
      if (error.code === 'P2002') {
        return res.status(409).json({
          error: 'A conflicting meeting details entry already exists',
          requestId,
          code: 'MEETING_DETAILS_CONFLICT'
        });
      }

      res.status(500).json({
        error: 'Unable to confirm meeting details at this time. Please try again later.',
        requestId,
        code: 'MEETING_DETAILS_ERROR'
      });
    }
  }
);

// ============================================
// GET USER'S MEETING DETAILS (Authenticated)
// ============================================

router.get('/my-meetings', 
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 requests per 15 minutes
    keyGenerator: (req) => `my_meetings_${req.user?.userId || 'anonymous'}_${req.ip}`
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

      // Get meeting details for this user
      const meetingDetails = await prisma.meetingDetails.findMany({
        where: {
          OR: [
            { userId: req.user.userId },
            { email: user.email }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          appointment: {
            select: { id: true, appointmentType: true, createdAt: true }
          }
        }
      });

      console.log(`✅ SECURITY: User ${user.email} accessed their meeting details from IP ${req.ip}`);

      res.json({
        meetingDetails,
        count: meetingDetails.length,
        requestId,
        code: 'MEETING_DETAILS_RETRIEVED'
      });

    } catch (error) {
      console.error(`❌ SECURITY: My meeting details error for request ${requestId}:`, error);
      res.status(500).json({
        error: 'Unable to retrieve meeting details',
        requestId,
        code: 'RETRIEVAL_ERROR'
      });
    }
  }
);

// ============================================
// UPDATE MEETING DETAILS (Authenticated)
// ============================================

router.put('/:meetingId',
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 updates per hour
    keyGenerator: (req) => `update_meeting_${req.user?.userId || 'anonymous'}_${req.ip}`
  }),
  authenticateToken,
  meetingDetailsValidation.filter(validation => 
    !validation.toString().includes('appointmentId') // Remove appointmentId validation for updates
  ),
  async (req, res) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    const meetingId = parseInt(req.params.meetingId);
    
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
          requestId,
          code: 'VALIDATION_ERROR'
        });
      }

      if (!meetingId || isNaN(meetingId)) {
        return res.status(400).json({
          error: 'Invalid meeting ID',
          requestId,
          code: 'INVALID_MEETING_ID'
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

      // Check if meeting details exist and user has permission
      const existingMeeting = await prisma.meetingDetails.findUnique({
        where: { id: meetingId }
      });

      if (!existingMeeting) {
        return res.status(404).json({
          error: 'Meeting details not found',
          requestId,
          code: 'MEETING_NOT_FOUND'
        });
      }

      if (existingMeeting.userId !== req.user.userId && existingMeeting.email !== user.email) {
        return res.status(403).json({
          error: 'You do not have permission to update these meeting details',
          requestId,
          code: 'UPDATE_ACCESS_DENIED'
        });
      }

      const {
        name, email, phone, company, position,
        meetingDate, meetingTime, duration, location,
        agenda, requirements, notes
      } = req.body;

      // Prepare update data
      const updateData = {};
      if (name) updateData.name = xss(name.trim());
      if (email) updateData.email = email.toLowerCase().trim();
      if (phone !== undefined) updateData.phone = phone ? xss(phone.trim()) : null;
      if (company !== undefined) updateData.company = company ? xss(company.trim()) : null;
      if (position !== undefined) updateData.position = position ? xss(position.trim()) : null;
      if (meetingDate !== undefined) updateData.meetingDate = meetingDate ? new Date(meetingDate) : null;
      if (meetingTime !== undefined) updateData.meetingTime = meetingTime ? meetingTime.trim() : null;
      if (duration) updateData.duration = duration;
      if (location) updateData.location = location;
      if (agenda !== undefined) updateData.agenda = agenda ? xss(agenda.trim()) : null;
      if (requirements !== undefined) updateData.requirements = requirements ? xss(requirements.trim()) : null;
      if (notes !== undefined) updateData.notes = notes ? xss(notes.trim()) : null;

      const updatedMeeting = await prisma.meetingDetails.update({
        where: { id: meetingId },
        data: updateData,
        include: {
          appointment: {
            select: { id: true, appointmentType: true }
          }
        }
      });

      console.log(`✅ SECURITY: Meeting details ${meetingId} updated by user ${user.email} from IP ${req.ip}`);

      res.json({
        message: 'Meeting details updated successfully!',
        meetingDetails: updatedMeeting,
        requestId,
        code: 'MEETING_DETAILS_UPDATED'
      });

    } catch (error) {
      console.error(`❌ SECURITY: Update meeting details error for request ${requestId}:`, error);
      res.status(500).json({
        error: 'Unable to update meeting details',
        requestId,
        code: 'UPDATE_ERROR'
      });
    }
  }
);

// ============================================
// DELETE MEETING DETAILS (Authenticated)
// ============================================

router.delete('/:meetingId',
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 deletions per hour
    keyGenerator: (req) => `delete_meeting_${req.user?.userId || 'anonymous'}_${req.ip}`
  }),
  authenticateToken,
  async (req, res) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    const meetingId = parseInt(req.params.meetingId);
    
    try {
      if (!meetingId || isNaN(meetingId)) {
        return res.status(400).json({
          error: 'Invalid meeting ID',
          requestId,
          code: 'INVALID_MEETING_ID'
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

      // Check if meeting details exist and user has permission
      const existingMeeting = await prisma.meetingDetails.findUnique({
        where: { id: meetingId }
      });

      if (!existingMeeting) {
        return res.status(404).json({
          error: 'Meeting details not found',
          requestId,
          code: 'MEETING_NOT_FOUND'
        });
      }

      if (existingMeeting.userId !== req.user.userId && existingMeeting.email !== user.email) {
        return res.status(403).json({
          error: 'You do not have permission to delete these meeting details',
          requestId,
          code: 'DELETE_ACCESS_DENIED'
        });
      }

      await prisma.meetingDetails.delete({
        where: { id: meetingId }
      });

      console.log(`✅ SECURITY: Meeting details ${meetingId} deleted by user ${user.email} from IP ${req.ip}`);

      res.json({
        message: 'Meeting details deleted successfully!',
        requestId,
        code: 'MEETING_DETAILS_DELETED'
      });

    } catch (error) {
      console.error(`❌ SECURITY: Delete meeting details error for request ${requestId}:`, error);
      res.status(500).json({
        error: 'Unable to delete meeting details',
        requestId,
        code: 'DELETE_ERROR'
      });
    }
  }
);

module.exports = { 
  router, 
  meetingDetailsLimiter 
};