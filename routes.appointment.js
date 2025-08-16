const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


const { authenticateToken } = require('./routes.auth');
const sendAppointmentConfirmationEmail = require('./utils/sendAppointmentConfirmationEmail');

// Book Appointment (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    const appointment = await prisma.appointment.create({
      data: { name, email, phone, message }
    });
    // Send confirmation email (do not block response on error)
    sendAppointmentConfirmationEmail({
      to: email,
      name,
      phone,
      message,
      date: appointment.createdAt ? appointment.createdAt.toISOString() : undefined
    }).catch(e => console.error('Email send error:', e));
    res.status(201).json({ message: 'Appointment booked', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

module.exports = router;
