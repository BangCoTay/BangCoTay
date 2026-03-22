const express = require('express');
const plansService = require('../services/plans.service');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /plans/generate
router.post('/generate', auth, async (req, res, next) => {
  try {
    const result = await plansService.generatePlan(req.user.id, req.user.subscriptionTier);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /plans/current
router.get('/current', auth, async (req, res, next) => {
  try {
    const result = await plansService.getCurrentPlan(req.user.id, req.user.subscriptionTier);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /plans/:planId/day/:dayNumber
router.get('/:planId/day/:dayNumber', auth, async (req, res, next) => {
  try {
    const dayNumber = parseInt(req.params.dayNumber, 10);
    if (isNaN(dayNumber)) {
      return res.status(400).json({ success: false, error: 'Invalid day number' });
    }
    const result = await plansService.getDayPlan(req.user.id, req.params.planId, dayNumber, req.user.subscriptionTier);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
