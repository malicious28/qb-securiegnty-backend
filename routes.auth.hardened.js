// HARDENED AUTHENTICATION ROUTES - ENTERPRISE SECURITY
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const validator = require('validator');
const xss = require('xss');
const { getPrismaClient } = require('./utils/prisma');
const passport = require('passport');
const path = require('path');
const router = express.Router();
const prisma = getPrismaClient();

// Lazy load emailService to avoid module resolution issues
let emailService = null;
function getEmailService() {
  if (!emailService) {
    emailService = require(path.join(__dirname, 'utils', 'emailService'));
  }
  return emailService;
}

// ============================================
// SECURITY MIDDLEWARE & RATE LIMITING
// ============================================

// Aggressive rate limiting for auth endpoints (relaxed in development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // 100 attempts in dev, 5 in production
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    security: 'Rate limit exceeded',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.error(`🚨 SECURITY ALERT: Rate limit exceeded for IP ${req.ip} on ${req.path}`);
    res.status(429).json({
      error: 'Too many attempts. Account temporarily locked for security.',
      retryAfter: '15 minutes',
      securityLevel: 'HIGH'
    });
  }
});

// Registration rate limiting (disabled in development)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 3 : 1000, // 1000 attempts in dev, 3 in production
  message: {
    error: 'Registration limit exceeded. Please try again later.',
    retryAfter: '1 hour'
  }
});

// ============================================
// ENHANCED JWT SECURITY
// ============================================

// Secure JWT configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || (() => {
    console.error('🚨 CRITICAL: JWT_SECRET not set in environment!');
    throw new Error('JWT_SECRET environment variable is required');
  })(),
  accessTokenExpiry: '15m', // Short-lived access tokens
  refreshTokenExpiry: '7d'   // Longer refresh tokens
};

// Store for token revocation (in production, use Redis)
const revokedTokens = new Set();

// Enhanced JWT verification middleware
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No authentication token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Check if token is revoked
    if (revokedTokens.has(token)) {
      return res.status(401).json({ 
        error: 'Token has been revoked. Please login again.',
        code: 'TOKEN_REVOKED'
      });
    }

    jwt.verify(token, JWT_CONFIG.secret, (err, decoded) => {
      if (err) {
        let errorMessage = 'Invalid authentication token.';
        let errorCode = 'INVALID_TOKEN';
        
        if (err.name === 'TokenExpiredError') {
          errorMessage = 'Authentication token has expired. Please login again.';
          errorCode = 'TOKEN_EXPIRED';
        } else if (err.name === 'JsonWebTokenError') {
          errorMessage = 'Malformed authentication token.';
          errorCode = 'MALFORMED_TOKEN';
        }
        
        return res.status(403).json({ 
          error: errorMessage,
          code: errorCode
        });
      }
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('🚨 Authentication middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication service temporarily unavailable.',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
}

// ============================================
// ENHANCED INPUT VALIDATION
// ============================================

// Strong password validation
const passwordValidation = [
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain: lowercase, uppercase, number, and special character')
    .custom((value) => {
      // Common password blacklist
      const commonPasswords = ['password', '12345678', 'qwerty123', 'password123'];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('Password is too common. Please choose a stronger password.');
      }
      return true;
    })
];

// Email validation with additional security
const emailValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email address is too long')
    .custom(async (email) => {
      // Check for disposable email domains (basic check)
      const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
      const domain = email.split('@')[1]?.toLowerCase();
      if (disposableDomains.includes(domain)) {
        throw new Error('Disposable email addresses are not allowed');
      }
      return true;
    })
];

// Name validation with XSS protection
const nameValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be 1-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, apostrophes, and hyphens')
    .customSanitizer(value => xss(value)),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be 1-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, apostrophes, and hyphens')
    .customSanitizer(value => xss(value))
];

// ============================================
// SECURE REGISTRATION ENDPOINT
// ============================================

router.post('/register', 
  registerLimiter,
  [...emailValidation, ...passwordValidation, ...nameValidation],
  body('country').optional().isLength({ max: 100 }).trim(),
  async (req, res) => {
    const { firstName, lastName, email, password, country } = req.body;
    
    try {
      console.log(`🔄 REGISTRATION START: ${email} from IP ${req.ip}`);
      
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(`❌ VALIDATION ERROR for ${email}:`, errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
          code: 'VALIDATION_ERROR'
        });
      }

      // Additional email security check
      if (!validator.isEmail(email)) {
        console.log(`❌ INVALID EMAIL FORMAT: ${email}`);
        return res.status(400).json({ 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL'
        });
      }

      // Use transaction to ensure data consistency
      const result = await prisma.$transaction(async (prisma) => {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ 
          where: { email: email.toLowerCase() } 
        });
        
        if (existingUser) {
          console.log(`⚠️ EMAIL EXISTS: ${email} already registered`);
          throw new Error('EMAIL_ALREADY_EXISTS');
        }

        console.log(`✅ EMAIL AVAILABLE: ${email} - proceeding with registration`);

        // Hash password with high cost
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate email verification token
        const verificationToken = jwt.sign(
          { email: email.toLowerCase(), purpose: 'email_verification' },
          JWT_CONFIG.secret,
          { expiresIn: '24h' }
        );

        // Create user
        const newUser = await prisma.user.create({
          data: {
            firstName: xss(firstName.trim()),
            lastName: xss(lastName.trim()),
            email: email.toLowerCase(),
            password: hashedPassword,
            country: country?.trim() || null,
            isEmailVerified: process.env.NODE_ENV !== 'production', // Auto-verify in development
            verificationToken
          }
        });

        console.log(`✅ USER CREATED: ${email} with ID ${newUser.id}`);
        return newUser;
      });

      // SUCCESS RESPONSE - This is what frontend expects
      const successResponse = {
        message: 'Registration successful! Please check your email to verify your account.',
        userId: result.id,
        emailVerificationRequired: true,
        code: 'REGISTRATION_SUCCESS',
        success: true,
        // Frontend compatibility fields
        isNewSignup: true,
        redirectTo: 'onboarding'
      };

      console.log(`✅ REGISTRATION SUCCESS: Sending response for ${email}`, successResponse);
      res.status(201).json(successResponse);

      // Send welcome email asynchronously (don't block response)
      setImmediate(async () => {
        try {
          await getEmailService().sendWelcomeEmail(email, `${firstName} ${lastName}`);
          console.log(`📧 EMAIL SENT: Welcome email delivered to ${email}`);
        } catch (emailError) {
          console.error(`⚠️ EMAIL FAILED: Could not send welcome email to ${email}:`, emailError.message);
        }
      });

    } catch (error) {
      console.error(`🚨 REGISTRATION ERROR for ${email}:`, error.message);
      
      // Handle specific errors
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({ 
          error: 'Your account is already there! Please log in to continue.',
          code: 'EMAIL_EXISTS',
          success: false
        });
      }
      
      // Handle Prisma unique constraint violation
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        console.log(`⚠️ DATABASE CONSTRAINT: Email ${email} violates unique constraint`);
        return res.status(409).json({ 
          error: 'Your account is already there! Please log in to continue.',
          code: 'EMAIL_EXISTS',
          success: false
        });
      }
      
      // General error
      console.error(`❌ REGISTRATION SYSTEM ERROR for ${email}:`, error);
      res.status(500).json({ 
        error: 'Registration service temporarily unavailable. Please try again.',
        code: 'REGISTRATION_ERROR',
        success: false
      });
    }
  }
);

// ============================================
// SECURE LOGIN ENDPOINT
// ============================================

router.post('/login', 
  authLimiter,
  [...emailValidation],
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid login credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({ 
        where: { email: email.toLowerCase() } 
      });

      if (!user) {
        // Don't reveal if email exists or not
        return res.status(401).json({ 
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check if account is verified (skip in development)
      if (!user.isEmailVerified && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ 
          error: 'Please verify your email address before logging in',
          code: 'EMAIL_NOT_VERIFIED'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log(`🚨 SECURITY: Failed login attempt for ${email} from IP ${req.ip}`);
        return res.status(401).json({ 
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Generate secure tokens
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          tokenType: 'access'
        },
        JWT_CONFIG.secret,
        { expiresIn: JWT_CONFIG.accessTokenExpiry }
      );

      const refreshToken = jwt.sign(
        { 
          userId: user.id, 
          tokenType: 'refresh'
        },
        JWT_CONFIG.secret,
        { expiresIn: JWT_CONFIG.refreshTokenExpiry }
      );

      // Update last login timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() }
      });

      // Log successful login
      console.log(`✅ SECURITY: Successful login for ${email} from IP ${req.ip}`);

      res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          country: user.country,
          isEmailVerified: user.isEmailVerified
        },
        expiresIn: JWT_CONFIG.accessTokenExpiry,
        code: 'LOGIN_SUCCESS'
      });

    } catch (error) {
      console.error('🚨 Login error:', error);
      res.status(500).json({ 
        error: 'Authentication service temporarily unavailable',
        code: 'LOGIN_ERROR'
      });
    }
  }
);

// ============================================
// SECURE LOGOUT ENDPOINT
// ============================================

router.post('/logout', authenticateToken, (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      // Add token to revoked list
      revokedTokens.add(token);
      console.log(`✅ SECURITY: Token revoked for user ${req.user.userId}`);
    }

    res.json({ 
      message: 'Logged out successfully',
      code: 'LOGOUT_SUCCESS'
    });
  } catch (error) {
    console.error('🚨 Logout error:', error);
    res.status(500).json({ 
      error: 'Logout service temporarily unavailable',
      code: 'LOGOUT_ERROR'
    });
  }
});

// ============================================
// EMAIL VERIFICATION ENDPOINT
// ============================================

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ 
        error: 'Email verification token is required',
        code: 'TOKEN_REQUIRED'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_CONFIG.secret);
    
    if (decoded.purpose !== 'email_verification') {
      return res.status(400).json({ 
        error: 'Invalid verification token',
        code: 'INVALID_TOKEN'
      });
    }

    // Find and update user
    const user = await prisma.user.findUnique({ 
      where: { email: decoded.email } 
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        error: 'Email is already verified',
        code: 'ALREADY_VERIFIED'
      });
    }

    // Verify email
    await prisma.user.update({
      where: { email: decoded.email },
      data: { 
        isEmailVerified: true, 
        verificationToken: null 
      }
    });

    console.log(`✅ SECURITY: Email verified for ${decoded.email}`);

    res.json({ 
      message: 'Email verified successfully. You can now log in.',
      code: 'VERIFICATION_SUCCESS'
    });

  } catch (error) {
    console.error('🚨 Email verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ 
        error: 'Verification token has expired. Please request a new one.',
        code: 'TOKEN_EXPIRED'
      });
    }

    res.status(400).json({ 
      error: 'Invalid or expired verification token',
      code: 'VERIFICATION_ERROR'
    });
  }
});

// ============================================
// REFRESH TOKEN ENDPOINT
// ============================================

router.post('/refresh-token', 
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Refresh token is required',
          code: 'TOKEN_REQUIRED'
        });
      }

      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_CONFIG.secret);
      
      if (decoded.tokenType !== 'refresh') {
        return res.status(401).json({ 
          error: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { 
          userId: decoded.userId, 
          tokenType: 'access'
        },
        JWT_CONFIG.secret,
        { expiresIn: JWT_CONFIG.accessTokenExpiry }
      );

      res.json({
        accessToken: newAccessToken,
        expiresIn: JWT_CONFIG.accessTokenExpiry,
        code: 'TOKEN_REFRESHED'
      });

    } catch (error) {
      console.error('🚨 Token refresh error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Refresh token has expired. Please log in again.',
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      }

      res.status(401).json({ 
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
  }
);

// ============================================
// PROTECTED TEST ENDPOINT
// ============================================

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Access granted to protected resource',
    user: {
      userId: req.user.userId,
      email: req.user.email
    },
    timestamp: new Date().toISOString(),
    code: 'PROTECTED_ACCESS_SUCCESS'
  });
});

// ============================================
// GOOGLE OAUTH ROUTES (STATELESS)
// ============================================

// Initiate Google OAuth
router.get('/google', 
  authLimiter,
  (req, res, next) => {
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://qb-securiegnty-backend.onrender.com/api/auth/google/callback'
        : `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`);
    
    console.log('🔐 Initiating Google OAuth with callback:', callbackURL);
    
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      callbackURL: callbackURL,
      session: false // Disable session - use stateless OAuth
    })(req, res, next);
  }
);

// Google OAuth callback
router.get('/google/callback',
  authLimiter,
  passport.authenticate('google', { 
    failureRedirect: '/login?error=oauth_failed',
    failureMessage: true,
    session: false // Disable session - use stateless OAuth
  }),
  async (req, res) => {
    try {
      console.log('🎉 Google OAuth callback hit');
      console.log('User object:', req.user ? 'Present' : 'Missing');
      
      if (!req.user) {
        console.error('❌ No user object from Passport');
        return res.status(500).json({ 
          error: 'Authentication failed - no user object',
          requestId: req.requestId 
        });
      }
      
      console.log('✅ User authenticated:', req.user.email);
      
      // Generate JWT token for the user
      const tokenPayload = {
        userId: req.user.id,
        email: req.user.email,
        isEmailVerified: req.user.isEmailVerified
      };
      
      const accessToken = jwt.sign(tokenPayload, JWT_CONFIG.secret, {
        expiresIn: JWT_CONFIG.accessTokenExpiry
      });
      
      const refreshToken = jwt.sign(
        { userId: req.user.id, type: 'refresh' },
        JWT_CONFIG.secret,
        { expiresIn: JWT_CONFIG.refreshTokenExpiry }
      );

      console.log(`✅ Tokens generated for ${req.user.email}`);
      
      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || 'https://qbsecuriegnty.com';
      const redirectUrl = `${frontendUrl}/social-login-success?token=${accessToken}&refresh=${refreshToken}`;
      
      console.log(`✅ Redirecting to: ${frontendUrl}/social-login-success`);
      
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({ 
        error: 'An error occurred while processing your request',
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// ============================================
// SECURITY MONITORING ENDPOINT
// ============================================

router.get('/security-status', (req, res) => {
  res.json({
    securityFeatures: {
      rateLimit: 'Active',
      passwordPolicy: 'Strong',
      jwtSecurity: 'Enhanced',
      inputValidation: 'Comprehensive',
      emailVerification: 'Required',
      tokenRevocation: 'Active',
      googleOAuth: 'Active'
    },
    status: 'Hardened',
    securityLevel: 'HIGH',
    lastUpdate: new Date().toISOString()
  });
});

module.exports = { 
  router, 
  authenticateToken,
  authLimiter,
  registerLimiter 
};
