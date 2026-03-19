import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { OnboardingData, UserProgress, DayPlan, ChatMessage, Quote } from '@/types';

export interface MigrationData {
  onboardingData?: OnboardingData;
  userProgress?: UserProgress;
  plan?: DayPlan[];
  chatMessages?: ChatMessage[];
  quotes?: Quote[];
}

export interface MigrationResponse {
  success: boolean;
  imported: {
    onboarding: boolean;
    plan: boolean;
    tasks: number;
    messages: number;
    quotes: number;
  };
}

export function useMigrateLocalStorage() {
  return useMutation({
    mutationFn: async (data: MigrationData) => {
      const response = await apiClient.post('/migration/import-localStorage', data);
      return response.data.data as MigrationResponse;
    },
    onSuccess: () => {
      // Clear localStorage after successful migration
      localStorage.removeItem('resetify-storage');
    },
  });
}
