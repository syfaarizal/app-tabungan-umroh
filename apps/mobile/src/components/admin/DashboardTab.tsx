import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useDashboardSummary } from '../../hooks/useReports';
import { useAuthStore } from '../../store/auth.store';
import { SkeletonCard } from '../SkeletonCard';
import { ErrorState } from '../ErrorState';
import { formatCurrency } from '../../utils/format';

export function DashboardTab() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError, refetch, isRefetching } = useDashboardSummary();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 py-4 pb-8"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#16A34A']} />}
    >
      <Text className="text-base text-muted">Halo, Admin</Text>
      <Text className="text-xl font-bold text-ink mb-6">Selamat datang kembali</Text>

      {isLoading ? (
        <View className="gap-3">
          <SkeletonCard /><SkeletonCard />
        </View>
      ) : null}
      {isError ? <ErrorState onRetry={refetch} /> : null}

      {data ? (
        <>
          <View className="flex-row gap-3 mb-3">
            <StatCard icon="people" label="Total User" value={String(data.totalUsers)} />
            <StatCard icon="wallet" label="Total Saldo" value={formatCurrency(data.totalSavings)} />
          </View>
          <View className="flex-row gap-3 mb-6">
            <StatCard icon="today" label="Setoran Hari Ini" value={formatCurrency(data.todayDeposit)} accent />
            <StatCard icon="calendar" label="Setoran Bulan Ini" value={formatCurrency(data.monthlyDeposit)} accent />
          </View>
        </>
      ) : null}

      <Text className="text-lg font-bold text-ink mb-3">Menu Cepat</Text>
      <View className="flex-row flex-wrap justify-between gap-y-4">
        <QuickAction icon="people" label="Kelola User" onPress={() => router.push('/(admin)/users')} />
        <QuickAction icon="swap-vertical" label="Transaksi" onPress={() => router.push('/(admin)/transactions')} />
        <QuickAction icon="add-circle" label="Setoran Baru" onPress={() => router.push('/(admin)/transactions/create')} />
        <QuickAction icon="document-text" label="Laporan" onPress={() => router.push('/(admin)/reports')} />
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, accent }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; accent?: boolean }) {
  return (
    <View className="flex-1 bg-surface rounded-card p-4 border border-border">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm text-muted flex-1">{label}</Text>
        <Ionicons name={icon} size={18} color={accent ? '#16A34A' : '#6B7280'} />
      </View>
      <Text className={`text-lg font-bold ${accent ? 'text-primary-700' : 'text-ink'}`}>{value}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="items-center gap-2" style={{ width: '22%' }}>
      <View className="w-14 h-14 rounded-2xl bg-primary-100 items-center justify-center">
        <Ionicons name={icon} size={26} color="#16A34A" />
      </View>
      <Text className="text-sm text-ink font-medium text-center">{label}</Text>
    </Pressable>
  );
}
