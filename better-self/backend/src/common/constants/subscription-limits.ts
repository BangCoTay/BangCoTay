import { SubscriptionTier } from '../../types/subscription-tier.enum';

export const SUBSCRIPTION_LIMITS = {
  [SubscriptionTier.FREE]: {
    daysUnlocked: 3,
    aiMessagesPerDay: 3,
    quoteRegenerationsPerDay: 3,
    features: ['Basic 30-day plan', 'Limited AI coach', 'Basic quotes'],
  },
  [SubscriptionTier.STARTER]: {
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
  [SubscriptionTier.PREMIUM]: {
    daysUnlocked: 30,
    aiMessagesPerDay: -1, // -1 means unlimited
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

export const TIER_HIERARCHY = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.STARTER]: 1,
  [SubscriptionTier.PREMIUM]: 2,
};
