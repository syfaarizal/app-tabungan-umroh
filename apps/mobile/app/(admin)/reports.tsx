import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { ErrorState } from '../../src/components/ErrorState';
import { SkeletonCard } from '../../src/components/SkeletonCard';
import { API_URL } from '../../src/constants/config';
import { ReportPeriod } from '../../src/api/reports.api';
import { useSummaryReport } from '../../src/hooks/useReports';
import { formatCurrency } from '../../src/utils/format';

const PERIODS: { label: string; value: ReportPeriod }[] = [
  { label: 'Harian', value: 'daily' },
  { label: 'Mingguan', value: 'weekly' },
  { label: 'Bulanan', value: 'monthly' },
  { label: 'Tahunan', value: 'yearly' },
];

export default function LaporanScreen() {
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const { data, isLoading, isError, refetch } = useSummaryReport(period);

  const handleExport = async () => {
    const url = `${API_URL}/reports/export?period=${period}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Export Laporan', 'Tidak dapat membuka tautan unduhan CSV.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 py-6">
        <Text className="text-xl font-bold text-ink mb-4">Laporan</Text>

        <Text className="text-base font-semibold text-ink mb-2">Filter</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {PERIODS.map((p) => (
            <Pressable
              key={p.value}
              onPress={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-full ${period === p.value ? 'bg-primary-600' : 'bg-primary-100'}`}
            >
              <Text className={period === p.value ? 'text-white font-semibold' : 'text-primary-700 font-semibold'}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? <SkeletonCard /> : null}
        {isError ? <ErrorState onRetry={refetch} /> : null}

        {data ? (
          <>
            <View className="bg-primary-600 rounded-card p-6 mb-4">
              <Text className="text-primary-100 text-base font-semibold mb-1">Total Setoran</Text>
              <Text className="text-white text-3xl font-extrabold">
                {formatCurrency(data.totalDeposit)}
              </Text>
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-surface rounded-card p-4 border border-border">
                <Text className="text-sm text-muted mb-1">Jumlah Transaksi</Text>
                <Text className="text-lg font-bold text-ink">{data.transactionCount}</Text>
              </View>
              <View className="flex-1 bg-surface rounded-card p-4 border border-border">
                <Text className="text-sm text-muted mb-1">Total User Aktif</Text>
                <Text className="text-lg font-bold text-ink">{data.activeUserCount}</Text>
              </View>
            </View>

            <Button label="Export Laporan (CSV)" onPress={handleExport} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
