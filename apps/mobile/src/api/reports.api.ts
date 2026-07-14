import { apiClient } from './client';
import { DashboardSummary } from '../types';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get('/reports/dashboard');
  return data.data;
}

export async function getSummaryReport(period: ReportPeriod) {
  const { data } = await apiClient.get('/reports/summary', { params: { period } });
  return data.data;
}
