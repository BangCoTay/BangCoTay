import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { useAuthContext } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { LandingPage } from '@/components/LandingPage';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { Dashboard } from '@/components/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AuthModal } from '@/components/AuthModal';
import { useState } from 'react';
import apiClient from '@/lib/api-client';

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

  const queryClient = useQueryClient();

  useEffect(() => {
    // Handle payment status from URL params
    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (paymentStatus === 'success') {
      const verifyPayment = async () => {
        try {
          if (sessionId) {
            import('sonner').then(({ toast }) => toast.info('Verifying payment...'));
            await apiClient.get(`/payments/verify-session?session_id=${sessionId}`);
          }
          
          import('sonner').then(({ toast }) => {
            toast.success('Payment successful! Welcome to the premium club.');
          });
          
          // Force refresh user profile and onboarding data to reflect the new tier
          queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
          queryClient.invalidateQueries({ queryKey: ['users', 'subscription'] });
          queryClient.invalidateQueries({ queryKey: ['onboarding'] });
          queryClient.invalidateQueries({ queryKey: ['plans'] });
          
          // Remove payment param from URL
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('payment');
          newParams.delete('session_id');
          setSearchParams(newParams);
        } catch (error) {
          console.error('Payment verification failed:', error);
          import('sonner').then(({ toast }) => {
            toast.error('Could not verify payment status automatically. If you have any issues, please refresh.');
          });
        }
      };
      
      verifyPayment();
    } else if (paymentStatus === 'canceled') {
      import('sonner').then(({ toast }) => {
        toast.error('Payment canceled. No worries, you can try again anytime.');
      });
      // Remove payment param from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('payment');
      newParams.delete('session_id');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams, queryClient]);

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

  // Determine which component to show based on auth state and currentView
  // This prevents the "landing page flash" for authenticated users
  let viewToShow = currentView;
  if (isAuthenticated && !isLoadingOnboarding) {
    if (currentView === 'landing') {
      viewToShow = onboardingData ? 'dashboard' : 'onboarding';
    }
  } else if (!isAuthenticated && currentView !== 'onboarding' && currentView !== 'landing') {
    viewToShow = 'landing';
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={viewToShow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {viewToShow === 'landing' && <LandingPage />}
          {viewToShow === 'onboarding' && <OnboardingFlow />}
          {viewToShow === 'dashboard' && <Dashboard />}
        </motion.div>
      </AnimatePresence>
      {isAuthModalOpen && <AuthModal onClose={handleCloseAuthModal} />}
    </>
  );
};

export default Index;
