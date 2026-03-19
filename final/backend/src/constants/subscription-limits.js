const SUBSCRIPTION_LIMITS = {
  free: {
    daysUnlocked: 3,
    // aiMessagesTotal: total lifetime AI messages allowed (-1 = unlimited)
    aiMessagesTotal: 5,
    // aiMessagesPerDay kept for backward compat but set to -1 (not used for limit checks)
    aiMessagesPerDay: -1,
    quoteRegenerationsPerDay: -1,
    hasAICompanion: false,
    features: ['3-day plan preview', '5 AI coach messages', 'Basic motivation quotes', 'Progress tracking'],
  },
  starter: {
    daysUnlocked: 30,
    aiMessagesTotal: 30,
    aiMessagesPerDay: -1,
    quoteRegenerationsPerDay: -1,
    hasAICompanion: false,
    features: [
      'Full 30-day plan',
      '30 AI coach messages',
      'Unlimited quote generation',
      'Progress tracking',
      'Priority support',
    ],
  },
  premium: {
    daysUnlocked: 30,
    aiMessagesTotal: 100,
    aiMessagesPerDay: -1,
    quoteRegenerationsPerDay: -1,
    hasAICompanion: true,
    features: [
      'Full 30-day plan',
      '100 AI coach messages',
      'Unlimited quote generation',
      'AI Companion (Friend / Family / Girlfriend)',
      'Advanced analytics',
      'Priority support',
    ],
  },
};

const TIER_HIERARCHY = {
  free: 0,
  starter: 1,
  premium: 2,
};

module.exports = { SUBSCRIPTION_LIMITS, TIER_HIERARCHY };
