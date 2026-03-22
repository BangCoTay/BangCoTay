import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@clerk/clerk-expo';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'starter' | 'premium';
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
}

export interface UserSubscriptionInfo {
  tier: 'free' | 'starter' | 'premium';
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  features: {
    daysUnlocked: number;
    aiMessagesTotal: number | null;
    aiMessagesPerDay: number | null;
    quoteRegenerationsPerDay: number | null;
    hasAICompanion: boolean;
  };
}

type SubscriptionTier = UserSubscriptionInfo['tier'];

interface RawUserProfile {
  id?: string;
  _id?: string;
  email?: string;
  full_name?: string;
  fullName?: string;
  avatar_url?: string;
  avatarUrl?: string;
  subscription_tier?: SubscriptionTier | string;
  subscriptionTier?: SubscriptionTier | string;
  onboarding_completed?: boolean;
  onboardingCompleted?: boolean;
  created_at?: string;
  createdAt?: string;
}

function normalizeUserProfile(raw: unknown): UserProfile {
  const r = raw as RawUserProfile | undefined;
  return {
    id: r?.id ?? r?._id ?? '',
    email: r?.email ?? '',
    fullName: r?.full_name ?? r?.fullName ?? '',
    avatarUrl: r?.avatar_url ?? r?.avatarUrl,
    subscriptionTier:
      (r?.subscription_tier ??
        r?.subscriptionTier ??
        'free') === 'starter' ||
      (r?.subscription_tier ?? r?.subscriptionTier) === 'premium'
        ? (r?.subscription_tier ??
            r?.subscriptionTier ??
            'free') as SubscriptionTier
        : 'free',
    onboardingCompleted:
      r?.onboarding_completed ?? r?.onboardingCompleted ?? false,
    createdAt: r?.created_at ?? r?.createdAt ?? new Date().toISOString(),
  };
}

interface RawUserSubscriptionLimits {
  daysUnlocked?: number;
  days_unlocked?: number;
  aiMessagesTotal?: number;
  ai_messages_total?: number;
  aiMessagesPerDay?: number;
  ai_messages_per_day?: number;
  quoteRegenerationsPerDay?: number;
  quote_regenerations_per_day?: number;
  hasAICompanion?: boolean;
  has_ai_companion?: boolean;
}

interface RawUserSubscription {
  tier?: SubscriptionTier | string;
  status?: string;
  currentPeriodEnd?: string;
  current_period_end?: string;
  cancelAtPeriodEnd?: boolean;
  cancel_at_period_end?: boolean;
  limits?: RawUserSubscriptionLimits;
}

function normalizeUserSubscription(raw: unknown): UserSubscriptionInfo {
  const r = raw as RawUserSubscription | undefined;
  const aiMessagesPerDayRaw =
    r?.limits?.aiMessagesPerDay ?? r?.limits?.ai_messages_per_day;
  const quoteRegenerationsPerDayRaw =
    r?.limits?.quoteRegenerationsPerDay ??
    r?.limits?.quote_regenerations_per_day;
  const aiMessagesTotalRaw =
    r?.limits?.aiMessagesTotal ?? r?.limits?.ai_messages_total;

  const aiMessagesPerDay =
    typeof aiMessagesPerDayRaw === 'number' && aiMessagesPerDayRaw === -1
      ? null
      : aiMessagesPerDayRaw ?? null;

  const aiMessagesTotal =
    typeof aiMessagesTotalRaw === 'number' && aiMessagesTotalRaw === -1
      ? null
      : aiMessagesTotalRaw ?? null;

  const quoteRegenerationsPerDay =
    typeof quoteRegenerationsPerDayRaw === 'number' &&
    quoteRegenerationsPerDayRaw === -1
      ? null
      : quoteRegenerationsPerDayRaw ?? null;

  return {
    tier:
      (r?.tier ?? 'free') === 'starter' || (r?.tier ?? 'free') === 'premium'
        ? (r?.tier ?? 'free') as SubscriptionTier
        : 'free',
    status: r?.status ?? '',
    currentPeriodEnd: r?.currentPeriodEnd ?? r?.current_period_end,
    cancelAtPeriodEnd:
      r?.cancelAtPeriodEnd ?? r?.cancel_at_period_end ?? false,
    features: {
      daysUnlocked:
        r?.limits?.daysUnlocked ?? r?.limits?.days_unlocked ?? 0,
      aiMessagesTotal,
      aiMessagesPerDay,
      quoteRegenerationsPerDay,
      hasAICompanion:
        r?.limits?.hasAICompanion ?? r?.limits?.has_ai_companion ?? false,
    },
  };
}

export function useUserProfile() {
  const { userId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get('/users/profile');
      return normalizeUserProfile(response.data.data);
    },
    enabled: isLoaded && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await apiClient.put('/users/profile', data);
      return normalizeUserProfile(response.data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useUserSubscription() {
  const { userId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['users', 'subscription'],
    queryFn: async () => {
      const response = await apiClient.get('/users/subscription');
      return normalizeUserSubscription(response.data.data);
    },
    enabled: isLoaded && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
