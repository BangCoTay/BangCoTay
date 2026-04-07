import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuthContext } from '@/contexts/AuthContext';

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

function normalizeCurrentPlanResponse(raw: unknown): any {
  if (!raw || typeof raw !== 'object') return raw;
  const rawObj = raw as RawCurrentPlanResponse;
  const normalizedDayPlans = (rawObj.dayPlans ?? []).map((dayPlan) => ({
    ...dayPlan,
    id: dayPlan.id ?? dayPlan._id,
    dayNumber: dayPlan.dayNumber ?? dayPlan.day_number ?? 0,
    tasks: (dayPlan.tasks ?? []).map((task) => ({
      ...task,
      id: task.id ?? task._id ?? '',
      type: task.type ?? task.task_type ?? '',
      completedAt: task.completedAt ?? task.completed_at,
    })),
  }));
  return { ...rawObj, dayPlans: normalizedDayPlans };
}

export function useCurrentPlan() {
  const { user, isLoading } = useAuthContext();
  const userId = user?.id;
  const isLoaded = !isLoading;
  return useQuery({
    queryKey: ['plans', 'current'],
    queryFn: async () => {
      const response = await apiClient.get('/plans/current');
      return normalizeCurrentPlanResponse(response.data.data);
    },
    enabled: isLoaded && !!userId,
    staleTime: 2 * 60 * 1000,
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
