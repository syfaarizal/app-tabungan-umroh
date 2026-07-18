import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState } from '../../src/components/ErrorState';
import { SkeletonCard } from '../../src/components/SkeletonCard';
import { useMyTransactionHistory } from '../../src/hooks/useTransactions';
import { useSavings } from '../../src/hooks/useSavings';
import { useAuthStore } from '../../src/store/auth.store';
import { Transaction } from '../../src/types';
import { formatCurrency } from '../../src/utils/format';

export default function UserDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const { data: savings, isLoading: isSavingsLoading, isError: isSavingsError, refetch: refetchSavings, isRefetching: isSavingsRefetching } = useSavings();
  const { data: history, isLoading: isHistoryLoading, isError: isHistoryError, refetch: refetchHistory, isRefetching: isHistoryRefetching } = useMyTransactionHistory(1);

  const recentTransactions = (history?.data ?? [])
    .filter((t) => t.status === 'CONFIRMED')
    .slice(0, 5);

  const isLoading = isSavingsLoading || isHistoryLoading;
  const isError = isSavingsError || isHistoryError;
  const isRefetching = isSavingsRefetching || isHistoryRefetching;
  const refetch = () => { refetchSavings(); refetchHistory(); };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerClassName="pb-6"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#16A34A']} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <View>
            <Text className="text-base text-muted">Assalamu&apos;alaikum,</Text>
            <Text className="text-xl font-bold text-ink">{user?.fullName ?? 'Jamaah'}</Text>
          </View>
          <Pressable onPress={() => router.push('/(user)/notifikasi')} className="p-2">
            <Ionicons name="notifications-outline" size={26} color="#1F2937" />
          </Pressable>
        </View>

        {/* Loading */}
        {isLoading ? (
          <View className="px-5"><SkeletonCard /></View>
        ) : null}

        {/* Error */}
        {isError && !isLoading ? (
          <View className="px-5"><ErrorState onRetry={refetch} /></View>
        ) : null}

        {/* Big Balance Card */}
        {savings ? (
          <>
            <View className="mx-4 mb-4">
              <View className="bg-primary-600 rounded-card p-6">
                <Text className="text-primary-100 text-base font-semibold mb-1">Saldo Anda</Text>
                <Text className="text-white text-4xl font-extrabold mb-4">
                  {formatCurrency(savings.currentBalance)}
                </Text>

                <View className="h-3 w-full rounded-full bg-white/30 overflow-hidden mb-2">
                  <View
                    style={{ width: `${Math.min(savings.progressPercent, 100)}%` }}
                    className="h-full bg-white rounded-full"
                  />
                </View>

                <View className="flex-row justify-between mt-1">
                  <Text className="text-primary-100 text-sm">
                    {savings.progressPercent}% terkumpul
                  </Text>
                  <Text className="text-primary-100 text-sm">
                    Target: {formatCurrency(savings.targetAmount)}
                  </Text>
                </View>
              </View>

              {/* Target Info */}
              <View className="flex-row gap-3 mt-3">
                <View className="flex-1 bg-surface rounded-card p-4 border border-border">
                  <Text className="text-sm text-muted mb-1">Target</Text>
                  <Text className="text-lg font-bold text-ink">
                    {formatCurrency(savings.targetAmount)}
                  </Text>
                </View>
                <View className="flex-1 bg-surface rounded-card p-4 border border-border">
                  <Text className="text-sm text-muted mb-1">Sisa</Text>
                  <Text className="text-lg font-bold text-ink">
                    {formatCurrency(savings.remainingAmount)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Transactions */}
            <View className="px-4 mb-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-ink">Transaksi Terakhir</Text>
                <Pressable onPress={() => router.push('/(user)/riwayat')}>
                  <Text className="text-sm text-primary-600 font-semibold">Lihat Semua</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : null}

        {/* Transaction List */}
        {!isLoading && !isHistoryLoading ? (
          recentTransactions.length > 0 ? (
            <View className="px-4">
              {recentTransactions.map((tx) => (
                <RecentTxRow key={tx.id} transaction={tx} />
              ))}
            </View>
          ) : (
            <View className="px-4 py-8 items-center">
              <Text className="text-muted text-base">Belum ada transaksi</Text>
            </View>
          )
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function RecentTxRow({ transaction }: { transaction: Transaction }) {
  const isDeposit = transaction.type === 'DEPOSIT';
  const dateStr = new Date(transaction.transactionDate).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <View className="bg-surface rounded-card px-4 py-3 mb-2 border border-border flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-sm text-muted">{dateStr}</Text>
        <Text className="text-base font-semibold text-ink mt-0.5">
          {isDeposit ? 'Setoran' : 'Penarikan'}
        </Text>
      </View>
      <Text className={`text-lg font-bold ${isDeposit ? 'text-primary-600' : 'text-danger'}`}>
        {isDeposit ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
      </Text>
    </View>
  );
}
