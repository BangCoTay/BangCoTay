import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
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
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // Do nothing
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Session expired or unauthorized');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
