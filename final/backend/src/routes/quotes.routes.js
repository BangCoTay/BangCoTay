const express = require('express');
const quotesService = require('../services/quotes.service');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /quotes
router.get('/', auth, async (req, res, next) => {
  try {
    const result = await quotesService.getQuotes(req.user.id, req.user.subscriptionTier);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /quotes/regenerate
router.post('/regenerate', auth, async (req, res, next) => {
  try {
    const result = await quotesService.regenerateQuotes(req.user.id, req.user.subscriptionTier);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
