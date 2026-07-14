import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/Button';
import { EmptyState } from '../../../src/components/EmptyState';
import { ErrorState } from '../../../src/components/ErrorState';
import { LoadingState } from '../../../src/components/LoadingState';
import {
  useAllTransactions,
  useConfirmTransaction,
  useRejectTransaction,
} from '../../../src/hooks/useTransactions';
import { Transaction } from '../../../src/types';
import { formatCurrency, formatDate } from '../../../src/utils/format';

export default function TransaksiScreen() {
  const [filterPending, setFilterPending] = useState(false);
  const { data, isLoading, isError, refetch } = useAllTransactions();
  const confirmTx = useConfirmTransaction();
  const rejectTx = useRejectTransaction();

  const transactions = (data?.data ?? []).filter((t) => !filterPending || t.status === 'PENDING');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 py-4 border-b border-border">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-ink">Transaksi</Text>
          <Pressable
            onPress={() => router.push('/(admin)/transactions/create')}
            className="bg-primary-600 rounded-button px-4 py-2"
          >
            <Text className="text-white font-bold">+ Setoran</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => setFilterPending((prev) => !prev)}
          className={`self-start px-4 py-2 rounded-full ${filterPending ? 'bg-warning' : 'bg-primary-100'}`}
        >
          <Text className={filterPending ? 'text-white font-semibold' : 'text-primary-700 font-semibold'}>
            {filterPending ? 'Menampilkan: Menunggu Konfirmasi' : 'Tampilkan Semua'}
          </Text>
        </Pressable>
      </View>

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState onRetry={refetch} /> : null}

      {!isLoading && !isError ? (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 py-4"
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListEmptyComponent={<EmptyState title="Belum ada transaksi" />}
          renderItem={({ item }) => (
            <TransactionRow
              transaction={item}
              onConfirm={() => confirmTx.mutate(item.id)}
              onReject={() => rejectTx.mutate(item.id)}
              isProcessing={confirmTx.isPending || rejectTx.isPending}
            />
          )}
        />
      ) : null}
    </SafeAreaView>
  );
}

function TransactionRow({
  transaction,
  onConfirm,
  onReject,
  isProcessing,
}: {
  transaction: Transaction;
  onConfirm: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  const isDeposit = transaction.type === 'DEPOSIT';

  return (
    <View className="bg-surface rounded-card p-4 border border-border">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-ink">{formatDate(transaction.transactionDate)}</Text>
          <Text className="text-sm text-muted">{transaction.note || (isDeposit ? 'Setoran' : 'Penarikan')}</Text>
        </View>
        <Text className={`text-lg font-bold ${isDeposit ? 'text-primary-600' : 'text-danger'}`}>
          {isDeposit ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
      </View>

      {transaction.status === 'PENDING' ? (
        <View className="flex-row gap-2 mt-2">
          <View className="flex-1">
            <Button label="Konfirmasi" onPress={onConfirm} disabled={isProcessing} />
          </View>
          <View className="flex-1">
            <Button label="Tolak" variant="outline" onPress={onReject} disabled={isProcessing} />
          </View>
        </View>
      ) : (
        <View className="flex-row items-center gap-1">
          <Ionicons
            name={transaction.status === 'REJECTED' ? 'close-circle' : 'checkmark-circle'}
            size={16}
            color={transaction.status === 'REJECTED' ? '#DC2626' : '#16A34A'}
          />
          <Text className="text-sm text-muted">
            {transaction.status === 'REJECTED' ? 'Ditolak' : `Dikonfirmasi ${transaction.recordedByAdmin?.fullName ?? ''}`}
          </Text>
        </View>
      )}
    </View>
  );
}
