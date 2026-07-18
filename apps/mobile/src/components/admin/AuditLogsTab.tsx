import { useState, useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getAuditLogs, AuditActionType } from '../../api/dashboard.api';
import { AuditLogEntry } from '../../types';
import { Button } from '../Button';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { SkeletonCard } from '../SkeletonCard';
import { AuditLogRow } from './AuditLogRow';
import { DateRangePicker } from './DateRangePicker';

const ACTION_OPTIONS: { label: string; value: AuditActionType | undefined }[] = [
  { label: 'Semua', value: undefined },
  { label: 'Buat User', value: 'CREATE_USER' },
  { label: 'Transaksi Baru', value: 'CREATE_TRANSACTION' },
  { label: 'Konfirmasi', value: 'CONFIRM_TRANSACTION' },
  { label: 'Tolak', value: 'REJECT_TRANSACTION' },
  { label: 'Hapus', value: 'DELETE_TRANSACTION' },
  { label: 'Sesuaikan Saldo', value: 'MANUAL_ADJUSTMENT' },
];

export function AuditLogsTab() {
  const [selectedAction, setSelectedAction] = useState<AuditActionType | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const params = {
    actionType: selectedAction,
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
    queryKey: ['audit-logs', params],
    queryFn: ({ pageParam = 1 }) => getAuditLogs({ ...params, page: pageParam, limit: 50 }),
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

  const renderItem = useCallback(({ item }: { item: AuditLogEntry }) => (
    <AuditLogRow item={item} />
  ), []);

  const ListHeader = (
    <View className="px-4 pt-4 pb-2">
      <Text className="text-sm text-muted mb-3">
        {totalCount > 0 ? `${totalCount} entri log` : 'Filter'}
      </Text>

      {/* Action type filter */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        {ACTION_OPTIONS.map((opt) => (
          <Pressable
            key={opt.label}
            onPress={() => setSelectedAction(opt.value)}
            className={`rounded-full px-3 py-1.5 border ${
              selectedAction === opt.value
                ? 'bg-primary-600 border-primary-600'
                : 'bg-surface border-border'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                selectedAction === opt.value ? 'text-white' : 'text-ink'
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

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
        <EmptyState title="Belum ada audit log" subtitle="Aktivitas admin akan ditampilkan di sini" />
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
      />
    </View>
  );
}
