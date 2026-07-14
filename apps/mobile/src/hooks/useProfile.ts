import { useMutation } from '@tanstack/react-query';
import { ChangePasswordPayload, changePassword } from '../api/profile.api';

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  });
}
