const express = require('express');
const subscriptionsService = require('../services/subscriptions.service');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /subscriptions/current
router.get('/current', auth, async (req, res, next) => {
  try {
    const result = await subscriptionsService.getCurrentSubscription(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /subscriptions/cancel
router.post('/cancel', auth, async (req, res, next) => {
  try {
    const result = await subscriptionsService.cancelSubscription(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
