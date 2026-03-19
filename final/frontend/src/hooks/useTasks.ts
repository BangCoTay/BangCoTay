import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Task {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  type: string;
  completed: boolean;
  completedAt?: string;
}

export interface CompleteTaskResponse {
  task: Task;
  progress: {
    totalTasksCompleted: number;
    streakDays: number;
  };
  streakUpdated: boolean;
  celebrationMessage?: string;
}

export function useTasks(dayNumber?: number, completed?: boolean) {
  return useQuery({
    queryKey: ['tasks', { dayNumber, completed }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dayNumber !== undefined) params.append('dayNumber', dayNumber.toString());
      if (completed !== undefined) params.append('completed', completed.toString());

      const response = await apiClient.get(`/tasks?${params.toString()}`);
      return response.data as Task[];
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.post(`/tasks/${taskId}/complete`);
      return response.data as CompleteTaskResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useUncompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.post(`/tasks/${taskId}/uncomplete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}
