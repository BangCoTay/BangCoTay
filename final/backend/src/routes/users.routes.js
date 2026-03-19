const express = require('express');
const Joi = require('joi');
const usersService = require('../services/users.service');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const updateProfileSchema = Joi.object({
  fullName: Joi.string().optional(),
  avatarUrl: Joi.string().uri().optional(),
});

// GET /users/profile
router.get('/profile', auth, async (req, res, next) => {
  try {
    const result = await usersService.getProfile(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// PUT /users/profile
router.put('/profile', auth, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const result = await usersService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /users/subscription
router.get('/subscription', auth, async (req, res, next) => {
  try {
    const result = await usersService.getSubscription(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
