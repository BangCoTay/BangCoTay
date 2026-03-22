const express = require('express');
const Joi = require('joi');
const paymentsService = require('../services/payments.service');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createCheckoutSchema = Joi.object({
  priceId: Joi.string().required(),
  tier: Joi.string().valid('free', 'starter', 'premium').required(),
});

// POST /payments/create-checkout
router.post('/create-checkout', auth, validate(createCheckoutSchema), async (req, res, next) => {
  try {
    const result = await paymentsService.createCheckout(req.user.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /payments/portal
router.get('/portal', auth, async (req, res, next) => {
  try {
    const result = await paymentsService.getPortal(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /payments/webhook (public - no auth, raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ success: false, error: 'Missing stripe-signature header' });
    }
    const result = await paymentsService.handleWebhook(signature, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /payments/verify-session?session_id=...
router.get('/verify-session', auth, async (req, res, next) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'session_id is required' });
    }
    const result = await paymentsService.verifySession(req.user.id, sessionId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
