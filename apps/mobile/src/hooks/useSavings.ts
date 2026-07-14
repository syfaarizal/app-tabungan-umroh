import { useQuery } from '@tanstack/react-query';
import { getMySavings } from '../api/savings.api';

export function useSavings() {
  return useQuery({ queryKey: ['savings', 'me'], queryFn: getMySavings });
}
