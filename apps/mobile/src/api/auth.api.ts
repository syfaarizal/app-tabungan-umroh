import { apiClient } from './client';
import { AuthUser } from '../types';

export interface LoginPayload {
  phoneNumber: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post('/auth/login', payload);
  return data.data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}
