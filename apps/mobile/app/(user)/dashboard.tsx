import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { ErrorState } from '../../src/components/ErrorState';
import { ProgressBar } from '../../src/components/ProgressBar';
import { SkeletonCard } from '../../src/components/SkeletonCard';
import { useSavings } from '../../src/hooks/useSavings';
import { useAuthStore } from '../../src/store/auth.store';
import { formatCurrency } from '../../src/utils/format';

export default function UserDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError, refetch, isRefetching } = useSavings();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerClassName="px-5 py-4 pb-8"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-base text-muted">Assalamu&apos;alaikum,</Text>
            <Text className="text-xl font-bold text-ink">{user?.fullName ?? 'Jamaah'}</Text>
          </View>
          <Pressable onPress={() => router.push('/(user)/notifikasi')} className="p-2">
            <Ionicons name="notifications-outline" size={26} color="#1F2937" />
          </Pressable>
        </View>

        {isLoading ? <SkeletonCard /> : null}
        {isError ? <ErrorState onRetry={refetch} /> : null}

        {data ? (
          <View className="bg-primary-600 rounded-card p-6 mb-6">
            <Text className="text-primary-100 text-base font-semibold mb-1">Saldo Tersimpan</Text>
            <Text className="text-white text-4xl font-extrabold mb-4">
              {formatCurrency(data.currentBalance)}
            </Text>
            <Text className="text-primary-100 text-sm mb-2">
              dari target {formatCurrency(data.targetAmount)}
            </Text>
            <ProgressBar percent={data.progressPercent} />
            <Text className="text-white text-sm font-semibold mt-2">
              {data.progressPercent}% tercapai
            </Text>
          </View>
        ) : null}

        {data ? (
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-surface rounded-card p-4 border border-border">
              <Text className="text-sm text-muted mb-1">Target Umroh</Text>
              <Text className="text-lg font-bold text-ink">{formatCurrency(data.targetAmount)}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-card p-4 border border-border">
              <Text className="text-sm text-muted mb-1">Sisa Target</Text>
              <Text className="text-lg font-bold text-ink">
                {formatCurrency(data.remainingAmount)}
              </Text>
            </View>
          </View>
        ) : null}

        <Button label="+ Setor Tabungan" onPress={() => router.push('/(user)/setor')} />

        <View className="flex-row flex-wrap gap-4 mt-8 justify-between">
          <MenuItem icon="time" label="Riwayat" onPress={() => router.push('/(user)/riwayat')} />
          <MenuItem icon="flag" label="Target" onPress={() => router.push('/(user)/dashboard')} />
          <MenuItem icon="person" label="Profil" onPress={() => router.push('/(user)/profil')} />
          <MenuItem
            icon="help-circle"
            label="Bantuan"
            onPress={() => router.push('/(user)/profil')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="items-center gap-2" style={{ width: '22%' }}>
      <View className="w-14 h-14 rounded-2xl bg-primary-100 items-center justify-center">
        <Ionicons name={icon} size={26} color="#16A34A" />
      </View>
      <Text className="text-sm text-ink font-medium text-center">{label}</Text>
    </Pressable>
  );
}
