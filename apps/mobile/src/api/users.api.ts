import { apiClient } from './client';
import { PaginatedResult, UserListItem } from '../types';

export async function getUsers(params: { page?: number; limit?: number; search?: string } = {}) {
  const { data } = await apiClient.get<{ data: PaginatedResult<UserListItem> }>('/users', { params });
  return data.data ?? { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function getUserById(id: string): Promise<UserListItem> {
  const { data } = await apiClient.get(`/users/${id}`);
  if (!data?.data) throw new Error('User tidak ditemukan');
  return data.data;
}

export interface CreateUserPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  targetAmount?: number;
}

export async function createUser(payload: CreateUserPayload) {
  const { data } = await apiClient.post('/users', payload);
  return data.data;
}

export async function updateUser(id: string, payload: Partial<CreateUserPayload>) {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data.data;
}

export async function deleteUser(id: string) {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data.data;
}
