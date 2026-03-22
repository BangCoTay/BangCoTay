import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@clerk/clerk-expo';

// Backend returns snake_case fields from Supabase; normalize to camelCase
interface RawPlanTask {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  type?: string;
  task_type?: string;
  completed?: boolean;
  completedAt?: string;
  completed_at?: string;
}

interface RawDayPlan {
  id?: string;
  _id?: string;
  dayNumber?: number;
  day_number?: number;
  unlocked?: boolean;
  tasks?: RawPlanTask[];
}

interface RawCurrentPlanResponse {
  dayPlans?: RawDayPlan[];
  [key: string]: unknown;
}

function normalizeCurrentPlanResponse(
  raw: unknown,
): RawCurrentPlanResponse | unknown {
  if (!raw || typeof raw !== 'object') return raw;

  const rawObj = raw as RawCurrentPlanResponse;
  const normalizedDayPlans: RawDayPlan[] = (rawObj.dayPlans ?? []).map(
    (dayPlan) => ({
      ...dayPlan,
      id: dayPlan.id ?? dayPlan._id,
      dayNumber: dayPlan.dayNumber ?? dayPlan.day_number ?? 0,
      tasks: (dayPlan.tasks ?? []).map((task) => ({
        ...task,
        id: task.id ?? task._id ?? '',
        type: task.type ?? task.task_type ?? '',
        completedAt: task.completedAt ?? task.completed_at,
      })),
    }),
  );

  return { ...rawObj, dayPlans: normalizedDayPlans };
}

export function useCurrentPlan() {
  const { userId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['plans', 'current'],
    queryFn: async () => {
      const response = await apiClient.get('/plans/current');
      return normalizeCurrentPlanResponse(response.data.data);
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
      return response.data.data;
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
      return response.data.data;
    },
    enabled: isLoaded && !!userId,
  });
}
