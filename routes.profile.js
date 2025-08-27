const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

// Use authenticateToken from routes.auth for consistency
const { authenticateToken } = require('./routes.auth');
console.log(authenticateToken); // Debug middleware import

// Get user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile (add more fields as needed)
router.put('/me', authenticateToken, async (req, res) => {
  try {
    // For now, only allow updating email
    const { email } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { email },
      select: { id: true, email: true, createdAt: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
