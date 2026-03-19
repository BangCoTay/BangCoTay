import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

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
  return useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const response = await apiClient.get('/progress');
      return response.data as Progress;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['progress', 'analytics'],
    queryFn: async () => {
      const response = await apiClient.get('/progress/analytics');
      return response.data as Analytics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
