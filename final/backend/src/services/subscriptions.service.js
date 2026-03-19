const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { SUBSCRIPTION_LIMITS } = require('../constants/subscription-limits');

const getCurrentSubscription = async (userId) => {
  const user = await User.findById(userId).select('subscription_tier');
  const tier = user?.subscription_tier || 'free';

  const subscription = await Subscription.findOne({
    user_id: userId,
    status: 'active',
  });

  const limits = SUBSCRIPTION_LIMITS[tier];

  return {
    tier,
    status: subscription?.status || 'free',
    stripeSubscriptionId: subscription?.stripe_subscription_id,
    currentPeriodStart: subscription?.current_period_start,
    currentPeriodEnd: subscription?.current_period_end,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
    features: limits.features,
    limits: {
      daysUnlocked: limits.daysUnlocked,
      aiMessagesPerDay: limits.aiMessagesPerDay,
      quoteRegenerationsPerDay: limits.quoteRegenerationsPerDay,
    },
  };
};

const cancelSubscription = async (userId) => {
  const subscription = await Subscription.findOne({
    user_id: userId,
    status: 'active',
  });

  if (!subscription) {
    const error = new Error('No active subscription found');
    error.statusCode = 400;
    throw error;
  }

  subscription.cancel_at_period_end = true;
  await subscription.save();

  return {
    subscription,
    message: 'Subscription will be canceled at the end of the billing period',
  };
};

module.exports = { getCurrentSubscription, cancelSubscription };
