import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@clerk/clerk-expo';
import type { UserProfile, UserSubscriptionInfo } from '@/types';

type SubscriptionTier = UserSubscriptionInfo['tier'];

interface RawUserProfile {
  id?: string;
  _id?: string;
  email?: string;
  full_name?: string;
  fullName?: string;
  avatar_url?: string;
  avatarUrl?: string;
  subscription_tier?: string;
  subscriptionTier?: string;
  onboarding_completed?: boolean;
  onboardingCompleted?: boolean;
  created_at?: string;
  createdAt?: string;
}

function normalizeUserProfile(raw: unknown): UserProfile {
  const r = raw as RawUserProfile | undefined;
  const tier = r?.subscription_tier ?? r?.subscriptionTier ?? 'free';
  return {
    id: r?.id ?? r?._id ?? '',
    email: r?.email ?? '',
    fullName: r?.full_name ?? r?.fullName ?? '',
    avatarUrl: r?.avatar_url ?? r?.avatarUrl,
    subscriptionTier: (tier === 'starter' || tier === 'premium' ? tier : 'free') as SubscriptionTier,
    onboardingCompleted: r?.onboarding_completed ?? r?.onboardingCompleted ?? false,
    createdAt: r?.created_at ?? r?.createdAt ?? new Date().toISOString(),
  };
}

function normalizeUserSubscription(raw: unknown): UserSubscriptionInfo {
  const r = raw as any;
  const limits = r?.limits ?? {};

  const normalize = (val: number | undefined) =>
    typeof val === 'number' && val === -1 ? null : val ?? null;

  return {
    tier: (['starter', 'premium'].includes(r?.tier) ? r.tier : 'free') as SubscriptionTier,
    status: r?.status ?? '',
    currentPeriodEnd: r?.currentPeriodEnd ?? r?.current_period_end,
    cancelAtPeriodEnd: r?.cancelAtPeriodEnd ?? r?.cancel_at_period_end ?? false,
    features: {
      daysUnlocked: limits.daysUnlocked ?? limits.days_unlocked ?? 3,
      aiMessagesTotal: normalize(limits.aiMessagesTotal ?? limits.ai_messages_total),
      aiMessagesPerDay: normalize(limits.aiMessagesPerDay ?? limits.ai_messages_per_day),
      quoteRegenerationsPerDay: normalize(limits.quoteRegenerationsPerDay ?? limits.quote_regenerations_per_day),
      hasAICompanion: limits.hasAICompanion ?? limits.has_ai_companion ?? false,
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
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { fullName?: string; avatarUrl?: string }) => {
      const response = await apiClient.put('/users/profile', data);
      return normalizeUserProfile(response.data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
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
    staleTime: 2 * 60 * 1000,
  });
}
