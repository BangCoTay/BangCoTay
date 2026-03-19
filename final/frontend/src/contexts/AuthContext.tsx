import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import apiClient, { setTokenGetter } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  subscriptionTier: string;
  onboardingCompleted: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId, getToken, signOut: clerkSignOut } = useAuth();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize the API client with the Clerk token getter
  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  // Sync Clerk user with our backend database
  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && userId && !dbUser && !isSyncing) {
        setIsSyncing(true);
        try {
          // This call will include the Clerk token via the interceptor
          const { data } = await apiClient.post('/auth/sync');
          if (data.success) {
            setDbUser(data.data.user);
          }
        } catch (error) {
          console.error('Failed to sync user with backend:', error);
        } finally {
          setIsSyncing(false);
        }
      } else if (isLoaded && !userId) {
        setDbUser(null);
      }
    };

    syncUser();
  }, [isLoaded, userId, dbUser, isSyncing]);

  const isLoading = !isLoaded || isSyncing;

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!userId, 
        isLoading, 
        user: dbUser,
        signOut: clerkSignOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
