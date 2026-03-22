import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
  tokenGetter = getter;
};

apiClient.interceptors.request.use(
  async (config) => {
    if (tokenGetter) {
      const token = await tokenGetter();
      console.log(`[API] Token retrieved: ${token ? 'Yes (starts with ' + token.substring(0, 10) + '...)' : 'No'}`);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      console.warn('[API] tokenGetter is not set!');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Let Clerk handle session expiry
    }
    return Promise.reject(error);
  }
);

export default apiClient;
