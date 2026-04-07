import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface TaskData {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  type: string;
  completed: boolean;
  completedAt?: string;
}

export interface CompleteTaskResponse {
  task: TaskData;
  progress: {
    totalTasksCompleted: number;
    streakDays: number;
  };
  streakUpdated: boolean;
  celebrationMessage?: string;
}

interface RawTask {
  id?: string;
  _id?: string;
  dayNumber?: number;
  day_number?: number;
  title?: string;
  description?: string;
  type?: string;
  task_type?: string;
  completed?: boolean;
  completedAt?: string;
  completed_at?: string;
}

function normalizeTask(raw: unknown): TaskData {
  const r = raw as RawTask | undefined;
  return {
    id: r?.id ?? r?._id ?? '',
    dayNumber: r?.dayNumber ?? r?.day_number ?? 0,
    title: r?.title ?? '',
    description: r?.description ?? '',
    type: r?.type ?? r?.task_type ?? '',
    completed: !!r?.completed,
    completedAt: r?.completedAt ?? r?.completed_at,
  };
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.post(`/tasks/${taskId}/complete`);
      const raw = response.data.data;
      return { ...raw, task: normalizeTask(raw.task) } as CompleteTaskResponse;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['plans', 'current'] });
      const previousPlans = queryClient.getQueryData(['plans', 'current']);
      queryClient.setQueryData(['plans', 'current'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          dayPlans: old.dayPlans.map((dayPlan: any) => ({
            ...dayPlan,
            tasks: dayPlan.tasks?.map((task: any) =>
              task.id === taskId ? { ...task, completed: true } : task
            ),
          })),
        };
      });
      return { previousPlans };
    },
    onError: (_err, _taskId, context) => {
      queryClient.setQueryData(['plans', 'current'], context?.previousPlans);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
  });
}

export function useUncompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.post(`/tasks/${taskId}/uncomplete`);
      return response.data.data;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['plans', 'current'] });
      const previousPlans = queryClient.getQueryData(['plans', 'current']);
      queryClient.setQueryData(['plans', 'current'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          dayPlans: old.dayPlans.map((dayPlan: any) => ({
            ...dayPlan,
            tasks: dayPlan.tasks?.map((task: any) =>
              task.id === taskId ? { ...task, completed: false } : task
            ),
          })),
        };
      });
      return { previousPlans };
    },
    onError: (_err, _taskId, context) => {
      queryClient.setQueryData(['plans', 'current'], context?.previousPlans);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}
