import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useAuthContext } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { LandingPage } from '@/components/LandingPage';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Dashboard } from '@/components/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';

const Index = () => {
  const { currentView, isDarkMode, setCurrentView } = useAppStore();
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuthContext();
  const { data: onboardingData, isLoading: isLoadingOnboarding } = useOnboarding();

  useEffect(() => {
    // Apply dark mode on initial load
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Handle view routing based on authentication and onboarding status
    if (!isLoadingAuth) {
      if (!isAuthenticated) {
        setCurrentView('landing');
      } else if (isAuthenticated && !isLoadingOnboarding && !onboardingData) {
        setCurrentView('onboarding');
      } else if (isAuthenticated && !isLoadingOnboarding && onboardingData) {
        setCurrentView('dashboard');
      }
    }
  }, [isAuthenticated, isLoadingAuth, isLoadingOnboarding, onboardingData, setCurrentView]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'onboarding' && <OnboardingFlow />}
        {currentView === 'dashboard' && <Dashboard />}
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
