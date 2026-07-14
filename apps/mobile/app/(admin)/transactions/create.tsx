import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/Button';
import { TextField } from '../../../src/components/TextField';
import { useCreateTransaction } from '../../../src/hooks/useTransactions';
import { useUsers } from '../../../src/hooks/useUsers';
import { UserListItem } from '../../../src/types';
import { formatCurrency } from '../../../src/utils/format';

const QUICK_AMOUNTS = [100_000, 200_000, 500_000, 1_000_000];

export default function TambahSetoranScreen() {
  const params = useLocalSearchParams<{ userId?: string }>();
  const { data: usersResult } = useUsers({ limit: 100 });
  const users = useMemo(() => usersResult?.data ?? [], [usersResult]);

  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createTransaction = useCreateTransaction();

  useEffect(() => {
    if (params.userId && !selectedUser) {
      const preselected = users.find((u) => u.id === params.userId);
      if (preselected) setSelectedUser(preselected);
    }
  }, [params.userId, users, selectedUser]);

  const handleSubmit = async () => {
    setError(null);
    if (!selectedUser) {
      setError('Pilih user terlebih dahulu');
      return;
    }
    if (amount < 1000) {
      setError('Masukkan nominal minimal Rp1.000');
      return;
    }
    try {
      await createTransaction.mutateAsync({ userId: selectedUser.id, amount, note: note || undefined });
      router.back();
    } catch {
      setError('Gagal menyimpan setoran. Silakan coba lagi.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-5 py-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="chevron-back" size={26} color="#1F2937" />
        </Pressable>
        <Text className="text-xl font-bold text-ink">Tambah Setoran</Text>
      </View>

      <ScrollView contentContainerClassName="px-5 py-6" keyboardShouldPersistTaps="handled">
        <Text className="text-base font-semibold text-ink mb-2">Pilih User</Text>
        <Pressable
          onPress={() => setPickerVisible(true)}
          className="min-h-[56px] rounded-button border-2 border-border px-4 justify-center bg-surface mb-4 flex-row items-center justify-between"
        >
          <Text className={selectedUser ? 'text-lg text-ink' : 'text-lg text-muted'}>
            {selectedUser ? `${selectedUser.fullName} - ${selectedUser.phoneNumber}` : 'Pilih jamaah'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </Pressable>

        <Text className="text-base font-semibold text-ink mb-2">Nominal</Text>
        <View className="rounded-button border-2 border-primary-600 px-4 py-3 mb-4 bg-surface">
          <TextInput
            value={amount > 0 ? formatCurrency(amount) : ''}
            onChangeText={(text) => {
              const numeric = Number(text.replace(/[^0-9]/g, ''));
              setAmount(Number.isNaN(numeric) ? 0 : numeric);
            }}
            placeholder="Rp0"
            keyboardType="number-pad"
            className="text-2xl font-bold text-ink"
          />
        </View>

        <View className="flex-row flex-wrap gap-2 mb-6">
          {QUICK_AMOUNTS.map((value) => (
            <Pressable
              key={value}
              onPress={() => setAmount((prev) => prev + value)}
              className="px-4 py-2 rounded-full bg-primary-100"
            >
              <Text className="text-primary-700 font-semibold">
                +{value >= 1_000_000 ? `${value / 1_000_000}JT` : `${value / 1000}RB`}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextField
          label="Keterangan (Opsional)"
          placeholder="Contoh: Setoran rutin"
          value={note}
          onChangeText={setNote}
        />

        {error ? <Text className="text-danger text-base mb-4 text-center">{error}</Text> : null}

        <Button label="Simpan Setoran" onPress={handleSubmit} loading={createTransaction.isPending} />
      </ScrollView>

      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center px-5 py-4 border-b border-border">
            <Pressable onPress={() => setPickerVisible(false)} className="mr-3 p-1">
              <Ionicons name="close" size={26} color="#1F2937" />
            </Pressable>
            <Text className="text-xl font-bold text-ink">Pilih Jamaah</Text>
          </View>
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-5 py-4"
            ItemSeparatorComponent={() => <View className="h-2" />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedUser(item);
                  setPickerVisible(false);
                }}
                className="bg-surface rounded-card p-4 border border-border flex-row items-center justify-between"
              >
                <View>
                  <Text className="text-base font-semibold text-ink">{item.fullName}</Text>
                  <Text className="text-sm text-muted">{item.phoneNumber}</Text>
                </View>
                <Text className="text-base font-bold text-primary-700">
                  {formatCurrency(item.savingAccount?.currentBalance ?? 0)}
                </Text>
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
