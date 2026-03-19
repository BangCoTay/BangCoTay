import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@clerk/clerk-react';

export interface Progress {
  currentDay: number;
  totalTasksCompleted: number;
  streakDays: number;
  completionRate: number;
  aiMessagesUsed: number;
  quoteRegenerations: number;
}

export interface Analytics {
  weeklyProgress: Array<{
    week: number;
    completed: number;
    total: number;
    percentage: number;
  }>;
  taskCompletionByType: {
    quit: { completed: number; total: number };
    adopt: { completed: number; total: number };
  };
  streakHistory: Array<{
    date: string;
    tasksCompleted: number;
  }>;
}

export function useProgress() {
  const { userId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const response = await apiClient.get('/progress');
      return response.data.data;
    },
    enabled: isLoaded && !!userId,
  });
}

export function useAnalytics(days: number = 7) {
  const { userId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['progress', 'analytics', days],
    queryFn: async () => {
      const response = await apiClient.get(`/progress/analytics?days=${days}`);
      return response.data.data;
    },
    enabled: isLoaded && !!userId,
  });
}
