import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyNotifications, markNotificationAsRead } from '../api/notifications.api';

export function useMyNotifications() {
  return useQuery({ queryKey: ['notifications', 'me'], queryFn: getMyNotifications });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
