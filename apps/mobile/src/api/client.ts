import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../constants/config';
import { STORAGE_KEYS, secureStorage } from '../utils/secure-storage';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await secureStorage.getItem(STORAGE_KEYS.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

/**
 * On 401, attempts a single refresh-token exchange and replays the queued
 * requests. Multiple simultaneous 401s only trigger one refresh call.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingQueue.push(() => resolve(apiClient(originalRequest)));
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await secureStorage.getItem(STORAGE_KEYS.refreshToken);
      if (!refreshToken) throw error;

      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = data.data;

      await secureStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
      await secureStorage.setItem(STORAGE_KEYS.refreshToken, newRefreshToken);

      pendingQueue.forEach((run) => run());
      pendingQueue = [];

      return apiClient(originalRequest);
    } catch (refreshError) {
      await secureStorage.removeItem(STORAGE_KEYS.accessToken);
      await secureStorage.removeItem(STORAGE_KEYS.refreshToken);
      await secureStorage.removeItem(STORAGE_KEYS.authUser);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
