import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useAuthQuery } from '@/hooks/useAuth';
import { authService, type MeResponse } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: MeResponse | null;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const { data: userData, isLoading, refetch } = useAuthQuery();

  useEffect(() => {
    // Update authentication state when user data changes
    setIsAuthenticated(!!userData);
  }, [userData]);

  const checkAuth = () => {
    setIsAuthenticated(authService.isAuthenticated());
    if (authService.isAuthenticated()) {
      refetch();
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user: userData ?? null, checkAuth }}>
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
