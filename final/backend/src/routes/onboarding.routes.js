const express = require('express');
const Joi = require('joi');
const onboardingService = require('../services/onboarding.service');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createOnboardingSchema = Joi.object({
  niche: Joi.string().valid('digital', 'mental', 'study', 'health', 'food', 'gaming').required(),
  addiction: Joi.string().required(),
  severity: Joi.string().valid('mild', 'moderate', 'severe').required(),
  painPoints: Joi.array()
    .items(
      Joi.string().valid('time', 'energy', 'confidence', 'sleep', 'relationships', 'money')
    )
    .required(),
});

// POST /onboarding
router.post('/', auth, validate(createOnboardingSchema), async (req, res, next) => {
  try {
    const result = await onboardingService.createOnboarding(req.user.id, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /onboarding
router.get('/', auth, async (req, res, next) => {
  try {
    const result = await onboardingService.getOnboarding(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
