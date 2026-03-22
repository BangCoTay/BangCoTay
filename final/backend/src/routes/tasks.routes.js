const express = require('express');
const tasksService = require('../services/tasks.service');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /tasks
router.get('/', auth, async (req, res, next) => {
  try {
    const dayNumber = req.query.dayNumber ? parseInt(req.query.dayNumber, 10) : undefined;
    const completed =
      req.query.completed !== undefined ? req.query.completed === 'true' : undefined;

    const result = await tasksService.getTasks(req.user.id, dayNumber, completed);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /tasks/:taskId/complete
router.post('/:taskId/complete', auth, async (req, res, next) => {
  try {
    const result = await tasksService.completeTask(req.user.id, req.params.taskId, req.user.subscriptionTier);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /tasks/:taskId/uncomplete
router.post('/:taskId/uncomplete', auth, async (req, res, next) => {
  try {
    const result = await tasksService.uncompleteTask(req.user.id, req.params.taskId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
