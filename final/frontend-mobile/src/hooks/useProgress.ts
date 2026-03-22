import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuthContext } from '@/contexts/AuthContext';

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
  const { user, isLoading } = useAuthContext();
  const userId = user?.id;
  const isLoaded = !isLoading;
  return useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const response = await apiClient.get('/progress');
      return response.data.data as Progress;
    },
    enabled: isLoaded && !!userId,
  });
}

export function useAnalytics(days: number = 7) {
  const { user, isLoading } = useAuthContext();
  const userId = user?.id;
  const isLoaded = !isLoading;
  return useQuery({
    queryKey: ['progress', 'analytics', days],
    queryFn: async () => {
      const response = await apiClient.get(`/progress/analytics?days=${days}`);
      return response.data.data as Analytics;
    },
    enabled: isLoaded && !!userId,
  });
}
