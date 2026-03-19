import { useAuthContext } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/appStore';

/**
 * Legacy hook bridge to Clerk-based AuthContext
 * This allows existing components to continue working with minimal changes.
 */
export function useAuth() {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  
  return { 
    data: user, 
    isLoading,
    isAuthenticated,
    // Add other fields if needed for compatibility
  };
}

export function useLogout() {
  const { signOut } = useAuthContext();
  const queryClient = useQueryClient();
  const { resetApp, setCurrentView } = useAppStore();

  return useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      resetApp();
      setCurrentView('landing');
    },
  });
}

// useLogin and useSignup are no longer needed as Clerk handles these
// through its own UI components. These are kept as placeholders to avoid breaking imports.
export function useLogin() {
  return { mutateAsync: () => Promise.reject('Use Clerk SignIn component instead') };
}

export function useSignup() {
  return { mutateAsync: () => Promise.reject('Use Clerk SignUp component instead') };
}
