import { useInfiniteQuery } from '@tanstack/react-query';
import { getAuditLogs, AuditLogsParams } from '../api/dashboard.api';

export function useAuditLogs(params: AuditLogsParams = {}) {
  return useInfiniteQuery({
    queryKey: ['audit-logs', params],
    queryFn: ({ pageParam = 1 }) => getAuditLogs({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage;
      if (meta.page >= meta.totalPages) return undefined;
      return meta.page + 1;
    },
  });
}
