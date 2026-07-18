import { useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getLedger } from '../../api/dashboard.api';
import { LedgerEntry } from '../../types';
import { Button } from '../Button';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { SkeletonCard } from '../SkeletonCard';
import { TransactionRow } from './TransactionRow';
import { DateRangePicker } from './DateRangePicker';

export function LedgerTab() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const params = {
    startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
    endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
  };

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['ledger', params],
    queryFn: ({ pageParam = 1 }) => getLedger({ ...params, page: pageParam, limit: 50 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const { meta } = lastPage;
      if (meta.page >= meta.totalPages) return undefined;
      return meta.page + 1;
    },
  });

  const flatData = (data?.pages ?? []).flatMap((p) => p.data);
  const totalCount = data?.pages?.[0]?.meta?.total ?? 0;

  const renderItem = useCallback(({ item }: { item: LedgerEntry }) => (
    <TransactionRow item={item} />
  ), []);

  const ListHeader = (
    <View className="px-4 pt-4 pb-2">
      <Text className="text-sm text-muted mb-3">
        {totalCount > 0 ? `${totalCount} transaksi` : 'Filter Tanggal'}
      </Text>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background px-4 pt-4">
        {ListHeader}
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </View>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;

  if (flatData.length === 0) {
    return (
      <View className="flex-1 bg-background">
        {ListHeader}
        <EmptyState title="Belum ada transaksi" subtitle="Tidak ada transaksi pada periode ini" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={
          hasNextPage ? (
            <View className="px-4 py-4">
              <Button
                label={isFetchingNextPage ? 'Memuat...' : 'Muat Lebih Banyak'}
                onPress={fetchNextPage}
                disabled={isFetchingNextPage}
                variant="outline"
              />
            </View>
          ) : (
            <View className="h-4" />
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#16A34A']} />
        }
        contentContainerClassName="px-4 pb-4"
      />
    </View>
  );
}
