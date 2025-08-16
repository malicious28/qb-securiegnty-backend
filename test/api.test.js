const request = require('supertest');
const express = require('express');
require('dotenv').config();

// Import your app (assuming index.js exports the app)
const app = require('../index');

describe('Backend API Endpoints', () => {
  it('GET / should return backend status', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Backend is running/);
  });

  it('POST /api/auth/register should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@example.com',
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
        country: 'Testland'
      });
    expect([201,400]).toContain(res.statusCode); // 400 if user exists
  });

  it('POST /api/auth/login should login a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'TestPass123!'
      });
    expect([200,400]).toContain(res.statusCode); // 400 if wrong credentials
    if(res.statusCode === 200) expect(res.body.token).toBeDefined();
  });

  it('POST /api/appointments should create an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        date: '2025-07-21',
        time: '10:00',
        service: 'Consultation'
      });
    expect([201,400]).toContain(res.statusCode);
  });

  it('POST /api/early-access should submit early access', async () => {
    const res = await request(app)
      .post('/api/early-access')
      .send({
        email: 'testuser@example.com',
        name: 'Test User'
      });
    expect([201,400]).toContain(res.statusCode);
  });
});
