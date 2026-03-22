import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser, useClerk } from "@clerk/clerk-expo";
import apiClient, { setTokenGetter } from "@/lib/api-client";

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
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId, getToken } = useAuth();
  const { signOut: clerkSignOut } = useClerk();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  const syncUser = async () => {
    if (isLoaded && userId && !isSyncing) {
      setIsSyncing(true);
      try {
        const { data } = await apiClient.post("/auth/sync");
        if (data.success) {
          setDbUser(data.data.user);
        }
      } catch (error) {
        console.error("Failed to sync user with backend:", error);
      } finally {
        setIsSyncing(false);
      }
    } else if (isLoaded && !userId) {
      setDbUser(null);
    }
  };

  useEffect(() => {
    syncUser();
  }, [isLoaded, userId]);

  const isLoading = !isLoaded || isSyncing;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!userId,
        isLoading,
        user: dbUser,
        signOut: () => clerkSignOut(),
        refreshUser: syncUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
