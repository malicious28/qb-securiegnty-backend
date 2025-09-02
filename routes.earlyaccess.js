
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const sendEarlyAccessEmail = require('./utils/sendEarlyAccessEmail');
const router = express.Router();
const prisma = new PrismaClient();

// Early Access (public - no auth required)
router.post('/', async (req, res) => {
  try {
    const { name, email, occupation } = req.body;
    if (!name || !email || !occupation) {
      return res.status(400).json({ error: 'Name, email, and occupation are required.' });
    }
    const earlyAccess = await prisma.earlyAccess.create({
      data: { name, email, occupation }
    });
    // Send early access email
    try {
      await sendEarlyAccessEmail(email, name);
    } catch (emailErr) {
      // Log but don't block response
      console.error('Failed to send early access email:', emailErr);
    }
    res.status(201).json({ message: 'Early access request submitted', earlyAccess });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit early access request' });
  }
});

module.exports = router;
