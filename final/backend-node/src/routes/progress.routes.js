const express = require('express');
const progressService = require('../services/progress.service');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /progress
router.get('/', auth, async (req, res, next) => {
  try {
    const result = await progressService.getProgress(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /progress/analytics
router.get('/analytics', auth, async (req, res, next) => {
  try {
    const result = await progressService.getAnalytics(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
