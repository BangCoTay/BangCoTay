const express = require('express');
const Joi = require('joi');
const authService = require('../services/auth.service');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// POST /auth/signup
router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout
router.post('/logout', auth, async (req, res) => {
  // With JWT, logout is handled client-side by discarding the token
  res.json({ success: true });
});

// GET /auth/me
router.get('/me', auth, async (req, res, next) => {
  try {
    const result = await authService.getMe(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token is required' });
    }
    const result = await authService.refreshToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
