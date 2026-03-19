import apiClient from './api-client';

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  subscription_tier: 'free' | 'starter' | 'premium';
  onboarding_completed: boolean;
}

export interface SubscriptionInfo {
  id: string;
  user_id: string;
  status: string;
  [key: string]: unknown;
}

export interface MeResponse {
  user: AuthUser | null;
  profile: UserProfile | null;
  subscription: SubscriptionInfo | null;
}

export interface AuthResponse {
  user: AuthUser | null;
  session?: {
    access_token: string;
    refresh_token: string;
  } | null;
  profile?: UserProfile | null;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  async getMe(): Promise<MeResponse> {
    const response = await apiClient.get<MeResponse>('/auth/me');
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Helper methods
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};
