import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { useAuthContext } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { LandingPage } from '@/components/LandingPage';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Dashboard } from '@/components/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { AuthModal } from '@/components/AuthModal';
import { useState } from 'react';

const Index = () => {
  const { currentView, isDarkMode, setCurrentView } = useAppStore();
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: onboardingData, isLoading: isLoadingOnboarding } = useOnboarding();
  // Track if we've just navigated to dashboard to avoid re-routing back to onboarding
  // during the brief window when the query is invalidating/refetching
  const justNavigatedToDashboard = useRef(false);

  useEffect(() => {
    // Apply dark mode on initial load
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Handle opening auth modal from URL params
    const authMode = searchParams.get('auth_mode');
    if (authMode && !isAuthenticated) {
      setIsAuthModalOpen(true);
    }
  }, [searchParams, isAuthenticated]);

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    // Remove auth_mode from URL without refreshing
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('auth_mode');
    setSearchParams(newParams);
  };

  useEffect(() => {
    // Handle view routing based on authentication and onboarding status
    if (!isLoadingAuth) {
      if (!isAuthenticated) {
        // Reset the flag when user signs out
        justNavigatedToDashboard.current = false;
        if (currentView !== 'onboarding' && currentView !== 'landing') {
          setCurrentView('landing');
        }
      } else if (isAuthenticated && !isLoadingOnboarding) {
        if (!onboardingData) {
          // Only route to onboarding if we haven't just completed it.
          // This guards against the race condition where the query is invalidated
          // but hasn't refetched yet (brief moment where onboardingData is undefined).
          if (!justNavigatedToDashboard.current) {
            setCurrentView('onboarding');
          }
        } else {
          // Onboarding data exists → go to dashboard
          justNavigatedToDashboard.current = false;
          setCurrentView('dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoadingAuth, isLoadingOnboarding, onboardingData, setCurrentView, currentView]);

  // Listen for the OnboardingFlow completing — it calls setCurrentView('dashboard') directly.
  // We set the flag here so the routing effect above doesn't immediately redirect back.
  useEffect(() => {
    if (currentView === 'dashboard') {
      justNavigatedToDashboard.current = true;
    }
  }, [currentView]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
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
      {isAuthModalOpen && <AuthModal onClose={handleCloseAuthModal} />}
    </>
  );
};

export default Index;
