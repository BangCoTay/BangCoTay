import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@clerk/clerk-react';

// Backend returns snake_case fields from Supabase; normalize to camelCase
function normalizeCurrentPlanResponse(raw: any) {
  if (!raw) return raw;

  const normalizedDayPlans =
    raw.dayPlans?.map((dayPlan: any) => ({
      ...dayPlan,
      // Ensure camelCase field used throughout the UI
      dayNumber: dayPlan.dayNumber ?? dayPlan.day_number,
      // Normalize tasks collection
      tasks: dayPlan.tasks?.map((task: any) => ({
        ...task,
        // Map snake_case to camelCase expected by components
        type: task.type ?? task.task_type,
        completedAt: task.completedAt ?? task.completed_at,
      })),
    })) ?? [];

  return {
    ...raw,
    dayPlans: normalizedDayPlans,
  };
}

export function useCurrentPlan() {
  const { userId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['plans', 'current'],
    queryFn: async () => {
      const response = await apiClient.get('/plans/current');
      return normalizeCurrentPlanResponse(response.data);
    },
    enabled: isLoaded && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useGeneratePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/plans/generate');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useDayPlan(date: string) {
  const { userId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['plans', 'day', date],
    queryFn: async () => {
      const response = await apiClient.get(`/plans/day/${date}`);
      return response.data;
    },
    enabled: isLoaded && !!userId,
  });
}
