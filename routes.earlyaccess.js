
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

// Initialize Prisma with error handling
let prisma;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('❌ Failed to initialize Prisma:', error);
}

// Import email utility with error handling
let sendEarlyAccessEmail;
try {
  sendEarlyAccessEmail = require('./utils/sendEarlyAccessEmail');
} catch (error) {
  console.error('⚠️ Email utility not available:', error.message);
}

// Early Access (public - no auth required)
router.post('/', async (req, res) => {
  console.log('📝 Early access request received:', req.body);
  
  try {
    const { name, email, occupation } = req.body;
    
    // Validate required fields
    if (!name || !email || !occupation) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Name, email, and occupation are required.',
        received: { name: !!name, email: !!email, occupation: !!occupation }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Check if Prisma is available
    if (!prisma) {
      console.error('❌ Database not available');
      return res.status(500).json({ error: 'Database connection unavailable' });
    }

    console.log('💾 Saving to database...');
    const earlyAccess = await prisma.earlyAccess.create({
      data: { name, email, occupation }
    });
    console.log('✅ Saved to database:', earlyAccess.id);

    // Send early access email (optional)
    if (sendEarlyAccessEmail) {
      try {
        await sendEarlyAccessEmail(email, name);
        console.log('📧 Email sent successfully');
      } catch (emailErr) {
        // Log but don't block response
        console.error('⚠️ Failed to send early access email:', emailErr.message);
      }
    } else {
      console.log('⚠️ Email service not configured');
    }

    console.log('✅ Early access request completed successfully');
    res.status(201).json({ 
      message: 'Early access request submitted successfully', 
      earlyAccess: {
        id: earlyAccess.id,
        name: earlyAccess.name,
        email: earlyAccess.email,
        occupation: earlyAccess.occupation
      }
    });

  } catch (err) {
    console.error('❌ Early access error:', err);
    
    // Handle specific Prisma errors
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already registered for early access' });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit early access request',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get early access requests (for admin)
router.get('/', async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({ error: 'Database connection unavailable' });
    }

    const earlyAccessRequests = await prisma.earlyAccess.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(earlyAccessRequests);
  } catch (err) {
    console.error('❌ Error fetching early access requests:', err);
    res.status(500).json({ error: 'Failed to fetch early access requests' });
  }
});

module.exports = router;
