import { apiClient } from './client';
import { SavingsSummary } from '../types';

export async function getMySavings(): Promise<SavingsSummary> {
  const { data } = await apiClient.get('/savings/me');
  return data.data;
}
