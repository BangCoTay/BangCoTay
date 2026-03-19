import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@clerk/clerk-react';

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
    aiMessagesPerDay: number | null;
    quoteRegenerationsPerDay: number | null;
  };
}

function normalizeUserProfile(raw: any): UserProfile {
  return {
    id: raw.id ?? raw._id,
    email: raw.email,
    fullName: raw.full_name ?? raw.fullName,
    avatarUrl: raw.avatar_url ?? raw.avatarUrl,
    subscriptionTier: raw.subscription_tier ?? raw.subscriptionTier ?? 'free',
    onboardingCompleted:
      raw.onboarding_completed ?? raw.onboardingCompleted ?? false,
    createdAt: raw.created_at ?? raw.createdAt,
  };
}

function normalizeUserSubscription(raw: any): UserSubscriptionInfo {
  const aiMessagesPerDayRaw = raw?.limits?.aiMessagesPerDay;
  const quoteRegenerationsPerDayRaw = raw?.limits?.quoteRegenerationsPerDay;

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
    currentPeriodEnd: raw.currentPeriodEnd ?? raw.current_period_end,
    cancelAtPeriodEnd: raw.cancelAtPeriodEnd ?? raw.cancel_at_period_end,
    features: {
      daysUnlocked: raw.limits?.daysUnlocked ?? raw.limits?.days_unlocked ?? 0,
      aiMessagesPerDay,
      quoteRegenerationsPerDay,
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
