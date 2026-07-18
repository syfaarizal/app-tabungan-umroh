import { useMutation } from '@tanstack/react-query';
import { postManualAdjustment } from '../api/dashboard.api';

export function useManualAdjustment() {
  return useMutation({
    mutationFn: postManualAdjustment,
  });
}
