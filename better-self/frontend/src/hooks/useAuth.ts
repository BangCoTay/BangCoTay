import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, type SignupData, type LoginData } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    enabled: authService.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSignup() {
  const navigate = useNavigate();
  const { setCurrentView } = useAppStore();

  return useMutation({
    mutationFn: (data: SignupData) => authService.signup(data),
    onSuccess: (data) => {
      authService.setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentView('onboarding');
    },
  });
}

export function useLogin() {
  const navigate = useNavigate();
  const { setCurrentView } = useAppStore();

  return useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (data) => {
      authService.setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Check if user has completed onboarding
      if (data.profile?.onboarding_completed) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('onboarding');
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setCurrentView, resetApp } = useAppStore();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      resetApp();
      setCurrentView('landing');
    },
  });
}
