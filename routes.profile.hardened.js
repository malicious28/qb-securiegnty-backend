// HARDENED PROFILE ROUTES - ENTERPRISE SECURITY
const express = require('express');
const { getPrismaClient } = require('./utils/prisma');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const validator = require('validator');
const router = express.Router();
const prisma = getPrismaClient();

// Import hardened authentication
const { authenticateToken } = require('./routes.auth.hardened');

// ============================================
// RATE LIMITING FOR PROFILE OPERATIONS
// ============================================

const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  message: {
    error: 'Too many profile requests. Please try again later.',
    retryAfter: '15 minutes'
  }
});

// Update profile rate limiting (more restrictive)
const updateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 updates per hour
  message: {
    error: 'Profile update limit exceeded. Please try again later.',
    retryAfter: '1 hour'
  }
});

// ============================================
// INPUT VALIDATION & SANITIZATION
// ============================================

const profileUpdateValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be 1-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, apostrophes, and hyphens')
    .customSanitizer(value => xss(value)),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be 1-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, apostrophes, and hyphens')
    .customSanitizer(value => xss(value)),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email address is too long')
    .custom(async (email, { req }) => {
      if (email) {
        // Check if email is already taken by another user
        const existingUser = await prisma.user.findUnique({ 
          where: { email: email.toLowerCase() } 
        });
        if (existingUser && existingUser.id !== req.user.userId) {
          throw new Error('Email is already in use by another account');
        }
      }
      return true;
    }),
  
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters')
    .matches(/^[A-Z]{2}$/)
    .withMessage('Country code must be uppercase letters only'),
  
  // Security: Don't allow other fields
  body().custom((value, { req }) => {
    const allowedFields = ['firstName', 'lastName', 'email', 'country'];
    const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
    if (extraFields.length > 0) {
      throw new Error(`Invalid fields: ${extraFields.join(', ')}`);
    }
    return true;
  })
];

// ============================================
// SECURE GET PROFILE ENDPOINT
// ============================================

router.get('/me', profileLimiter, authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
        // SECURITY: Explicitly exclude password and sensitive fields
      }
    });

    if (!user) {
      console.error(`🚨 SECURITY: Profile access attempt for non-existent user ID ${req.user.userId}`);
      return res.status(404).json({ 
        error: 'User profile not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Log profile access
    console.log(`✅ SECURITY: Profile accessed by user ${user.email} from IP ${req.ip}`);

    res.json({
      user,
      code: 'PROFILE_SUCCESS'
    });

  } catch (error) {
    console.error('🚨 Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Profile service temporarily unavailable',
      code: 'PROFILE_ERROR'
    });
  }
});

// ============================================
// SECURE UPDATE PROFILE ENDPOINT
// ============================================

router.put('/me', 
  updateLimiter, 
  authenticateToken, 
  profileUpdateValidation,
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
          code: 'VALIDATION_ERROR'
        });
      }

      const { firstName, lastName, email, country } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });

      if (!existingUser) {
        return res.status(404).json({ 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Prepare update data (only include provided fields)
      const updateData = {};
      if (firstName !== undefined) updateData.firstName = xss(firstName.trim());
      if (lastName !== undefined) updateData.lastName = xss(lastName.trim());
      if (country !== undefined) updateData.country = country.toUpperCase();
      
      // Handle email change (requires re-verification)
      if (email !== undefined && email !== existingUser.email) {
        updateData.email = email.toLowerCase();
        updateData.isVerified = false; // Require re-verification for email change
        // TODO: Send new verification email
        console.log(`✅ SECURITY: Email change requested for user ${req.user.userId}: ${existingUser.email} -> ${email}`);
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: req.user.userId },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          country: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Log profile update
      console.log(`✅ SECURITY: Profile updated for user ${updatedUser.email} from IP ${req.ip}`);

      let responseMessage = 'Profile updated successfully';
      if (email !== undefined && email !== existingUser.email) {
        responseMessage += '. Please verify your new email address.';
      }

      res.json({
        message: responseMessage,
        user: updatedUser,
        emailVerificationRequired: email !== undefined && email !== existingUser.email,
        code: 'PROFILE_UPDATED'
      });

    } catch (error) {
      console.error('🚨 Profile update error:', error);
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        return res.status(409).json({ 
          error: 'Email is already in use by another account',
          code: 'EMAIL_CONFLICT'
        });
      }

      res.status(500).json({ 
        error: 'Profile update service temporarily unavailable',
        code: 'UPDATE_ERROR'
      });
    }
  }
);

// ============================================
// SECURE DELETE PROFILE ENDPOINT
// ============================================

router.delete('/me', 
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 1, // Only 1 deletion attempt per day
    message: {
      error: 'Account deletion limit exceeded. Please contact support.',
      retryAfter: '24 hours'
    }
  }),
  authenticateToken,
  body('confirmDelete')
    .equals('DELETE_MY_ACCOUNT')
    .withMessage('Must confirm deletion with exact phrase: DELETE_MY_ACCOUNT'),
  async (req, res) => {
    try {
      // Check validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Account deletion confirmation required',
          required: 'confirmDelete: "DELETE_MY_ACCOUNT"',
          code: 'CONFIRMATION_REQUIRED'
        });
      }

      const userId = req.user.userId;

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Log deletion attempt
      console.log(`🚨 SECURITY: Account deletion requested for user ${user.email} from IP ${req.ip}`);

      // Delete user (this will cascade to related records)
      await prisma.user.delete({
        where: { id: userId }
      });

      console.log(`✅ SECURITY: Account deleted for user ${user.email}`);

      res.json({
        message: 'Account deleted successfully',
        code: 'ACCOUNT_DELETED'
      });

    } catch (error) {
      console.error('🚨 Account deletion error:', error);
      res.status(500).json({ 
        error: 'Account deletion service temporarily unavailable',
        code: 'DELETION_ERROR'
      });
    }
  }
);

// ============================================
// PROFILE SECURITY STATUS ENDPOINT
// ============================================

router.get('/security-status', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const securityStatus = {
      emailVerified: user?.isVerified || false,
      accountAge: user?.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0,
      lastUpdate: user?.updatedAt,
      securityLevel: user?.isVerified ? 'VERIFIED' : 'UNVERIFIED',
      recommendations: []
    };

    if (!user?.isVerified) {
      securityStatus.recommendations.push('Verify your email address for enhanced security');
    }

    res.json({
      securityStatus,
      code: 'SECURITY_STATUS_SUCCESS'
    });

  } catch (error) {
    console.error('🚨 Security status error:', error);
    res.status(500).json({ 
      error: 'Security status service temporarily unavailable',
      code: 'SECURITY_STATUS_ERROR'
    });
  }
});

module.exports = router;
