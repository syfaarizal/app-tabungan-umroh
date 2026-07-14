import { apiClient } from './client';
import { AppNotification } from '../types';

export async function getMyNotifications(): Promise<AppNotification[]> {
  const { data } = await apiClient.get('/notifications/me');
  return data.data;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}
