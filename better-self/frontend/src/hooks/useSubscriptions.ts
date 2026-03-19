import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface RawSubscription {
  tier?: 'free' | 'starter' | 'premium';
  status: string;
  stripeSubscriptionId?: string;
  stripe_subscription_id?: string;
  currentPeriodStart?: string;
  current_period_start?: string;
  currentPeriodEnd?: string;
  current_period_end?: string;
  cancelAtPeriodEnd?: boolean;
  cancel_at_period_end?: boolean;
  features?: string[];
  limits?: {
    daysUnlocked?: number;
    days_unlocked?: number;
    aiMessagesPerDay?: number;
    quoteRegenerationsPerDay?: number;
  };
}

export interface Subscription {
  tier: 'free' | 'starter' | 'premium';
  status: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  features: string[];
  limits: {
    daysUnlocked: number;
    aiMessagesPerDay: number | null;
    quoteRegenerationsPerDay: number | null;
  };
}

function normalizeSubscription(raw: RawSubscription): Subscription {
  const aiMessagesPerDayRaw = raw.limits?.aiMessagesPerDay;
  const quoteRegenerationsPerDayRaw = raw.limits?.quoteRegenerationsPerDay;

  const aiMessagesPerDay =
    typeof aiMessagesPerDayRaw === 'number' && aiMessagesPerDayRaw === -1
      ? null
      : aiMessagesPerDayRaw ?? null;

  const quoteRegenerationsPerDay =
    typeof quoteRegenerationsPerDayRaw === 'number' &&
    quoteRegenerationsPerDayRaw === -1
      ? null
      : quoteRegenerationsPerDayRaw ?? null;

  return {
    tier: raw.tier ?? 'free',
    status: raw.status,
    stripeSubscriptionId:
      raw.stripeSubscriptionId ?? raw.stripe_subscription_id,
    currentPeriodStart: raw.currentPeriodStart ?? raw.current_period_start,
    currentPeriodEnd: raw.currentPeriodEnd ?? raw.current_period_end,
    cancelAtPeriodEnd: raw.cancelAtPeriodEnd ?? raw.cancel_at_period_end ?? false,
    features: raw.features ?? [],
    limits: {
      daysUnlocked: raw.limits?.daysUnlocked ?? raw.limits?.days_unlocked ?? 0,
      aiMessagesPerDay,
      quoteRegenerationsPerDay,
    },
  };
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['subscriptions', 'current'],
    queryFn: async () => {
      const response = await apiClient.get('/subscriptions/current');
      return normalizeSubscription(response.data);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/subscriptions/cancel');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
