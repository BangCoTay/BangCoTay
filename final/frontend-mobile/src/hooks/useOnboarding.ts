import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { OnboardingData } from "@/types";
import { useAuth } from "@clerk/clerk-expo";

export function useOnboarding() {
  const { userId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ["onboarding"],
    queryFn: async () => {
      const response = await apiClient.get("/onboarding");
      return response.data.data;
    },
    enabled: isLoaded && !!userId,
    retry: false,
  });
}

export function useSubmitOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: OnboardingData) => {
      const response = await apiClient.post("/onboarding", {
        niche: data.niche,
        addiction: data.addiction,
        severity: data.severity,
        painPoints: data.painPoints,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
