import { useQuery } from '@tanstack/react-query';
import { ReportPeriod, getDashboardSummary, getSummaryReport } from '../api/reports.api';

export function useDashboardSummary() {
  return useQuery({ queryKey: ['reports', 'dashboard'], queryFn: getDashboardSummary });
}

export function useSummaryReport(period: ReportPeriod) {
  return useQuery({
    queryKey: ['reports', 'summary', period],
    queryFn: () => getSummaryReport(period),
  });
}
