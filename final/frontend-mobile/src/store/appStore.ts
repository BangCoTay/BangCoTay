import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Niche, Severity, PainPoint } from '@/types';

interface AppState {
  onboardingStep: number;
  tempOnboardingData: {
    niche: Niche | null;
    addiction: string | null;
    severity: Severity | null;
    painPoints: PainPoint[];
  };

  setOnboardingStep: (step: number) => void;
  nextOnboardingStep: () => void;
  prevOnboardingStep: () => void;

  setNiche: (niche: Niche) => void;
  setAddiction: (addiction: string) => void;
  setSeverity: (severity: Severity) => void;
  togglePainPoint: (painPoint: PainPoint) => void;
  clearTempOnboardingData: () => void;

  resetApp: () => void;
}

const initialTempOnboardingData = {
  niche: null,
  addiction: null,
  severity: null,
  painPoints: [] as PainPoint[],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, _get) => ({
      onboardingStep: 0,
      tempOnboardingData: initialTempOnboardingData,

      setOnboardingStep: (step) => set({ onboardingStep: step }),
      nextOnboardingStep: () => set((state) => ({ onboardingStep: state.onboardingStep + 1 })),
      prevOnboardingStep: () => set((state) => ({ onboardingStep: Math.max(0, state.onboardingStep - 1) })),

      setNiche: (niche) =>
        set((state) => ({
          tempOnboardingData: { ...state.tempOnboardingData, niche },
        })),
      setAddiction: (addiction) =>
        set((state) => ({
          tempOnboardingData: { ...state.tempOnboardingData, addiction },
        })),
      setSeverity: (severity) =>
        set((state) => ({
          tempOnboardingData: { ...state.tempOnboardingData, severity },
        })),
      togglePainPoint: (painPoint) =>
        set((state) => {
          const current = state.tempOnboardingData.painPoints;
          const newPoints = current.includes(painPoint)
            ? current.filter((p) => p !== painPoint)
            : [...current, painPoint];
          return {
            tempOnboardingData: { ...state.tempOnboardingData, painPoints: newPoints },
          };
        }),
      clearTempOnboardingData: () => set({ tempOnboardingData: initialTempOnboardingData }),

      resetApp: () =>
        set({
          onboardingStep: 0,
          tempOnboardingData: initialTempOnboardingData,
        }),
    }),
    {
      name: 'resetify-ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tempOnboardingData: state.tempOnboardingData,
      }),
    }
  )
);
