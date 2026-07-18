import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSavings } from '../../src/hooks/useSavings';
import { useAuthStore } from '../../src/store/auth.store';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { formatCurrency } from '../../src/utils/format';

export default function UserProfilScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { data: savings } = useSavings();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 py-6">
        <Text className="text-xl font-bold text-ink mb-6">Profil</Text>

        {/* Avatar & Name */}
        <Card className="mb-5 items-center py-6">
          <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3">
            <Ionicons name="person" size={40} color="#16A34A" />
          </View>
          <Text className="text-xl font-bold text-ink">{user?.fullName ?? '-'}</Text>
          <Text className="text-base text-muted mt-1">{user?.phoneNumber ?? '-'}</Text>
        </Card>

        {/* Balance Info */}
        <Card className="mb-6">
          <Text className="text-base font-bold text-ink mb-4">Informasi Tabungan</Text>

          <View className="gap-3">
            <InfoRow label="Saldo Saat Ini" value={formatCurrency(savings?.currentBalance ?? 0)} valueColor="text-primary-600" />
            <View className="h-px bg-border" />
            <InfoRow label="Target Umroh" value={formatCurrency(savings?.targetAmount ?? 0)} />
            <View className="h-px bg-border" />
            <InfoRow label="Tercapai" value={`${savings?.progressPercent ?? 0}%`} />
          </View>
        </Card>

        {/* Logout */}
        <View className="mt-4">
          <Button
            label="Keluar"
            variant="outline"
            onPress={() => setShowLogoutConfirm(true)}
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Keluar dari Akun"
        message="Anda yakin ingin keluar?"
        confirmLabel="Ya, Keluar"
        danger
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  valueColor = 'text-ink',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-base text-muted">{label}</Text>
      <Text className={`text-base font-bold ${valueColor}`}>{value}</Text>
    </View>
  );
}
