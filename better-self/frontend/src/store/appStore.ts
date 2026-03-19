import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Niche, Severity, PainPoint, HealthyHabit } from '@/types';

// UI-only state - all business logic moved to backend
interface AppState {
  // UI state only
  currentView: 'landing' | 'onboarding' | 'dashboard';
  onboardingStep: number;
  isDarkMode: boolean;

  // Temporary onboarding form state (cleared after submission)
  tempOnboardingData: {
    niche: Niche | null;
    addiction: string | null;
    severity: Severity | null;
    painPoints: PainPoint[];
    healthyHabit: HealthyHabit | null;
  };

  // UI Actions
  setCurrentView: (view: 'landing' | 'onboarding' | 'dashboard') => void;
  setOnboardingStep: (step: number) => void;
  nextOnboardingStep: () => void;
  prevOnboardingStep: () => void;
  toggleDarkMode: () => void;

  // Temporary onboarding form actions (UI only)
  setNiche: (niche: Niche) => void;
  setAddiction: (addiction: string) => void;
  setSeverity: (severity: Severity) => void;
  togglePainPoint: (painPoint: PainPoint) => void;
  setHealthyHabit: (habit: HealthyHabit) => void;
  clearTempOnboardingData: () => void;

  // Reset UI state
  resetApp: () => void;
}

const initialTempOnboardingData = {
  niche: null,
  addiction: null,
  severity: null,
  painPoints: [],
  healthyHabit: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'landing',
      onboardingStep: 0,
      isDarkMode: false,
      tempOnboardingData: initialTempOnboardingData,

      setCurrentView: (view) => set({ currentView: view }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      nextOnboardingStep: () => set((state) => ({ onboardingStep: state.onboardingStep + 1 })),
      prevOnboardingStep: () => set((state) => ({ onboardingStep: Math.max(0, state.onboardingStep - 1) })),
      toggleDarkMode: () => {
        const newDarkMode = !get().isDarkMode;
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ isDarkMode: newDarkMode });
      },

      // Temporary form state management (UI only)
      setNiche: (niche) => set((state) => ({
        tempOnboardingData: { ...state.tempOnboardingData, niche }
      })),
      setAddiction: (addiction) => set((state) => ({
        tempOnboardingData: { ...state.tempOnboardingData, addiction }
      })),
      setSeverity: (severity) => set((state) => ({
        tempOnboardingData: { ...state.tempOnboardingData, severity }
      })),
      togglePainPoint: (painPoint) => set((state) => {
        const currentPoints = state.tempOnboardingData.painPoints;
        const newPoints = currentPoints.includes(painPoint)
          ? currentPoints.filter(p => p !== painPoint)
          : [...currentPoints, painPoint];
        return { tempOnboardingData: { ...state.tempOnboardingData, painPoints: newPoints } };
      }),
      setHealthyHabit: (habit) => set((state) => ({
        tempOnboardingData: { ...state.tempOnboardingData, healthyHabit: habit }
      })),
      clearTempOnboardingData: () => set({ tempOnboardingData: initialTempOnboardingData }),

      resetApp: () => {
        document.documentElement.classList.remove('dark');
        set({
          currentView: 'landing',
          onboardingStep: 0,
          isDarkMode: false,
          tempOnboardingData: initialTempOnboardingData,
        });
      },
    }),
    {
      name: 'resetify-ui-storage',
      // Only persist UI preferences
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
