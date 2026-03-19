const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { SUBSCRIPTION_LIMITS } = require('../constants/subscription-limits');

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User profile not found');
    error.statusCode = 404;
    throw error;
  }
  return user.toJSON();
};

const updateProfile = async (userId, { fullName, avatarUrl }) => {
  const updateData = {};
  if (fullName !== undefined) updateData.full_name = fullName;
  if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  if (!user) {
    const error = new Error('Failed to update profile');
    error.statusCode = 500;
    throw error;
  }
  return user.toJSON();
};

const getSubscription = async (userId) => {
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

module.exports = { getProfile, updateProfile, getSubscription };
