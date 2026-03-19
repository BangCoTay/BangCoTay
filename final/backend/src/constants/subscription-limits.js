const SUBSCRIPTION_LIMITS = {
  free: {
    daysUnlocked: 3,
    aiMessagesPerDay: 3,
    quoteRegenerationsPerDay: 3,
    features: ['Basic 30-day plan', 'Limited AI coach', 'Basic quotes'],
  },
  starter: {
    daysUnlocked: 7,
    aiMessagesPerDay: 10,
    quoteRegenerationsPerDay: 5,
    features: [
      'Extended 7-day access',
      'More AI messages',
      'More quote regenerations',
      'Progress tracking',
    ],
  },
  premium: {
    daysUnlocked: 30,
    aiMessagesPerDay: -1,
    quoteRegenerationsPerDay: -1,
    features: [
      'Full 30-day plan access',
      'Unlimited AI coach (GPT-4)',
      'Unlimited quotes',
      'Advanced analytics',
      'Priority support',
      'Support messages from loved ones',
    ],
  },
};

const TIER_HIERARCHY = {
  free: 0,
  starter: 1,
  premium: 2,
};

module.exports = { SUBSCRIPTION_LIMITS, TIER_HIERARCHY };
