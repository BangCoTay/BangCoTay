const express = require('express');

const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const onboardingRoutes = require('./onboarding.routes');
const plansRoutes = require('./plans.routes');
const tasksRoutes = require('./tasks.routes');
const progressRoutes = require('./progress.routes');
const chatRoutes = require('./chat.routes');
const quotesRoutes = require('./quotes.routes');
const paymentsRoutes = require('./payments.routes');
const subscriptionsRoutes = require('./subscriptions.routes');
const migrationRoutes = require('./migration.routes');

const router = express.Router();

// Health check
router.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'Better Self API is running', timestamp: new Date().toISOString() } });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/plans', plansRoutes);
router.use('/tasks', tasksRoutes);
router.use('/progress', progressRoutes);
router.use('/chat', chatRoutes);
router.use('/quotes', quotesRoutes);
router.use('/payments', paymentsRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/migration', migrationRoutes);

module.exports = router;
