import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

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
  return useQuery({
    queryKey: ['plans', 'current'],
    queryFn: async () => {
      const response = await apiClient.get('/plans/current');
      return normalizeCurrentPlanResponse(response.data);
    },
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

export function useDayPlan(planId: string | undefined, dayNumber: number | undefined) {
  return useQuery({
    queryKey: ['plans', planId, 'day', dayNumber],
    queryFn: async () => {
      const response = await apiClient.get(`/plans/${planId}/day/${dayNumber}`);
      return response.data;
    },
    enabled: !!planId && !!dayNumber,
  });
}
