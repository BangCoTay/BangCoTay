import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useAuth } from "@clerk/clerk-react";

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

function normalizeTask(raw: unknown): Task {
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

export function useTasks(dayNumber?: number, completed?: boolean) {
  const { userId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ["tasks", { dayNumber, completed }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dayNumber !== undefined)
        params.append("dayNumber", dayNumber.toString());
      if (completed !== undefined)
        params.append("completed", completed.toString());

      const response = await apiClient.get(`/tasks?${params.toString()}`);
      const rawData = response.data.data;
      const rawTasks = Array.isArray(rawData) ? rawData : [];
      return rawTasks.map(normalizeTask);
    },
    enabled: isLoaded && !!userId,
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.post(`/tasks/${taskId}/complete`);
      const raw = response.data.data;
      return {
        ...raw,
        task: normalizeTask(raw.task),
      } as CompleteTaskResponse;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ["plans", "current"] });
      const previousPlans = queryClient.getQueryData(["plans", "current"]);

      queryClient.setQueryData(["plans", "current"], (old: any) => {
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
      queryClient.setQueryData(["plans", "current"], context?.previousPlans);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "messages"] });
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
      await queryClient.cancelQueries({ queryKey: ["plans", "current"] });
      const previousPlans = queryClient.getQueryData(["plans", "current"]);

      queryClient.setQueryData(["plans", "current"], (old: any) => {
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
        queryClient.setQueryData(["plans", "current"], context?.previousPlans);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Task>;
    }) => {
      const response = await apiClient.patch(`/tasks/${id}`, updates);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
