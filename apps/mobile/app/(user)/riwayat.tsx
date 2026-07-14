import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/EmptyState';
import { ErrorState } from '../../src/components/ErrorState';
import { LoadingState } from '../../src/components/LoadingState';
import { useMyTransactionHistory } from '../../src/hooks/useTransactions';
import { Transaction, TransactionType } from '../../src/types';
import { formatCurrency, formatDate } from '../../src/utils/format';

const FILTERS: { label: string; value: TransactionType | 'ALL' }[] = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Setoran', value: 'DEPOSIT' },
  { label: 'Penarikan', value: 'WITHDRAWAL' },
];

export default function RiwayatScreen() {
  const [filter, setFilter] = useState<TransactionType | 'ALL'>('ALL');
  const { data, isLoading, isError, refetch } = useMyTransactionHistory();

  const transactions = (data?.data ?? []).filter((t) => filter === 'ALL' || t.type === filter);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 py-4 border-b border-border">
        <Text className="text-xl font-bold text-ink mb-3">Riwayat Tabungan</Text>
        <View className="flex-row gap-2">
          {FILTERS.map((f) => (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full ${
                filter === f.value ? 'bg-primary-600' : 'bg-primary-100'
              }`}
            >
              <Text className={filter === f.value ? 'text-white font-semibold' : 'text-primary-700 font-semibold'}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState onRetry={refetch} /> : null}

      {!isLoading && !isError ? (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 py-4"
          ListEmptyComponent={
            <EmptyState title="Belum ada transaksi" subtitle="Riwayat setoran Anda akan tampil di sini" />
          }
          renderItem={({ item }) => <TransactionRow transaction={item} />}
          ItemSeparatorComponent={() => <View className="h-3" />}
        />
      ) : null}
    </SafeAreaView>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isDeposit = transaction.type === 'DEPOSIT';
  const statusLabel =
    transaction.status === 'PENDING'
      ? 'Menunggu konfirmasi'
      : transaction.status === 'REJECTED'
        ? 'Ditolak'
        : transaction.recordedByAdmin?.fullName
          ? `Oleh ${transaction.recordedByAdmin.fullName}`
          : 'Setoran Awal';

  return (
    <View className="bg-surface rounded-card p-4 border border-border flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink">{formatDate(transaction.transactionDate)}</Text>
        <Text className="text-sm text-muted mt-0.5">{isDeposit ? 'Setoran' : 'Penarikan'}</Text>
        <Text className="text-sm text-muted">{statusLabel}</Text>
      </View>
      <Text className={`text-lg font-bold ${isDeposit ? 'text-primary-600' : 'text-danger'}`}>
        {isDeposit ? '+' : '-'}
        {formatCurrency(transaction.amount)}
      </Text>
    </View>
  );
}
