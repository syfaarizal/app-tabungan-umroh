import { useInfiniteQuery } from '@tanstack/react-query';
import { getLedger, LedgerParams } from '../api/dashboard.api';

export function useLedger(params: LedgerParams = {}) {
  return useInfiniteQuery({
    queryKey: ['ledger', params],
    queryFn: ({ pageParam = 1 }) => getLedger({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage;
      if (meta.page >= meta.totalPages) return undefined;
      return meta.page + 1;
    },
  });
}
