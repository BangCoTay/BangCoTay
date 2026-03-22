const express = require('express');
const Joi = require('joi');
const chatService = require('../services/chat.service');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const sendMessageSchema = Joi.object({
  content: Joi.string().required(),
  coachPersona: Joi.string().optional(),
});

// POST /chat/messages
router.post('/messages', auth, validate(sendMessageSchema), async (req, res, next) => {
  try {
    const result = await chatService.sendMessage(req.user.id, req.body, req.user.subscriptionTier);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /chat/messages
router.get('/messages', auth, async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
    // Optional 'role' query param: 'coach' | 'friend' | 'family' | 'girlfriend'
    const role = req.query.role || null;
    const result = await chatService.getMessages(req.user.id, role, limit, offset);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// DELETE /chat/messages
router.delete('/messages', auth, async (req, res, next) => {
  try {
    const result = await chatService.deleteMessages(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
