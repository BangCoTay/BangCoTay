import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
  tokenGetter = getter;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    if (tokenGetter) {
      const token = await tokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Fallback to localStorage for initial migration period or if needed
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for basic error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If error is 401 and we are not on landing, maybe the session expired
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/') {
        // window.location.href = '/'; 
        // We'll let Clerk hooks handle redirection if needed
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
