import { useState, useMemo } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../api/users.api';
import { useManualAdjustment } from '../../hooks/useManualAdjustment';
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '../Button';
import { Card } from '../Card';
import { ConfirmDialog } from '../ConfirmDialog';
import { EmptyState } from '../EmptyState';
import { TextField } from '../TextField';
import { formatCurrency } from '../../utils/format';

const adjustmentSchema = z.object({
  amount: z.string().min(1, 'Jumlah harus diisi').refine((v) => {
    const n = Number(v.replace(/[^\d-]/g, ''));
    return !isNaN(n) && n !== 0;
  }, 'Jumlah tidak valid'),
  reason: z.string().min(3, 'Alasan minimal 3 karakter'),
});

type AdjustmentForm = z.infer<typeof adjustmentSchema>;

export function ManualAdjustmentTab() {
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; fullName: string; phoneNumber: string; currentBalance: number } | null>(null);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [adjustmentResult, setAdjustmentResult] = useState<{ newBalance: number; timestamp: string } | null>(null);

  const debouncedSearch = useDebounce(searchText, 400);

  const { data: usersResult, isLoading: isSearching } = useQuery({
    queryKey: ['users-search', debouncedSearch],
    queryFn: () => getUsers({ search: debouncedSearch, limit: 20 }),
    enabled: debouncedSearch.length >= 2,
  });

  const users = usersResult?.data ?? [];

  const { mutate: submitAdjustment, isPending: isSubmitting } = useManualAdjustment();

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<AdjustmentForm>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { amount: '', reason: '' },
  });

  const amountRaw = watch('amount');
  const reason = watch('reason');

  const numericAmount = useMemo(() => {
    const raw = Number(amountRaw.replace(/[^\d-]/g, ''));
    return isNaN(raw) ? 0 : raw;
  }, [amountRaw]);

  const currentBalance = selectedUser?.currentBalance ?? 0;
  const newBalance = currentBalance + numericAmount;

  const onConfirmPress = () => {
    Keyboard.dismiss();
    setShowConfirm(true);
  };

  const onSubmit = () => {
    if (!selectedUser) return;
    submitAdjustment(
      { userId: selectedUser.id, amount: numericAmount, reason },
      {
        onSuccess: (result) => {
          if (!result) return;
          setShowConfirm(false);
          setAdjustmentResult({ newBalance: result.newBalance, timestamp: new Date().toISOString() });
          setShowSuccess(true);
        },
      },
    );
  };

  const onReset = () => {
    setSelectedUser(null);
    setSearchText('');
    setShowSuccess(false);
    setAdjustmentResult(null);
    reset();
  };

  const selectUser = (user: NonNullable<typeof users>[number]) => {
    setSelectedUser({
      id: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      currentBalance: Number(user.savingAccount?.currentBalance ?? 0),
    });
    setShowUserPicker(false);
    setSearchText('');
    reset();
  };

  // Format number input
  const onAmountChange = (text: string) => {
    const cleaned = text.replace(/[^\d-]/g, '');
    const sign = cleaned.startsWith('-') ? '-' : '';
    const digits = cleaned.replace('-', '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setValue('amount', sign + digits, { shouldValidate: true });
  };

  const previewColor = numericAmount > 0 ? '#10B981' : numericAmount < 0 ? '#EF4444' : '#6B7280';
  const formattedCurrent = formatCurrency(currentBalance);
  const formattedNew = formatCurrency(newBalance);

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-4 pb-8" keyboardShouldPersistTaps="handled">
      {/* Selected User Card */}
      {selectedUser ? (
        <Card className="mb-4">
          <Text className="text-sm text-muted mb-1">User Dipilih</Text>
          <Text className="text-lg font-bold text-ink">{selectedUser.fullName}</Text>
          <Text className="text-sm text-muted">{selectedUser.phoneNumber}</Text>
          <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border">
            <Text className="text-sm text-muted">Saldo Saat Ini</Text>
            <Text className="text-base font-bold text-ink">{formattedCurrent}</Text>
          </View>
          <Pressable onPress={() => { setSelectedUser(null); reset(); }} className="mt-2 self-end">
            <Text className="text-sm text-danger font-semibold">Ubah User</Text>
          </Pressable>
        </Card>
      ) : (
        <Pressable onPress={() => setShowUserPicker(true)} className="mb-4">
          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-muted">Pilih User untuk disesuaikan</Text>
              <Text className="text-primary-600 font-semibold">Pilih</Text>
            </View>
          </Card>
        </Pressable>
      )}

      {/* Adjustment Form */}
      {selectedUser && (
        <Card className="mb-4">
          <Text className="text-base font-bold text-ink mb-4">Form Penyesuaian Saldo</Text>

          {/* Amount Input */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-ink mb-2">Jumlah Penyesuaian</Text>
            <View className="relative">
              <Text className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted">Rp</Text>
              <TextInput
                value={amountRaw}
                onChangeText={onAmountChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                className="min-h-[60px] rounded-button border-2 border-border bg-surface pl-12 pr-4 text-2xl text-ink font-bold"
                style={{ fontSize: 28 }}
              />
            </View>
            {errors.amount && <Text className="text-danger text-sm mt-1">{errors.amount.message}</Text>}
          </View>

          {/* Reason Input */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-ink mb-2">Alasan</Text>
            <TextInput
              {...register('reason')}
              multiline
              numberOfLines={3}
              placeholder="Contoh: Koreksi saldo, kesalahan input"
              placeholderTextColor="#9CA3AF"
              className="min-h-[80px] rounded-button border-2 border-border bg-surface px-4 py-3 text-base text-ink"
              textAlignVertical="top"
            />
            {errors.reason && <Text className="text-danger text-sm mt-1">{errors.reason.message}</Text>}
          </View>

          {/* Preview */}
          {numericAmount !== 0 && (
            <View className="rounded-button border-2 border-dashed p-4 mb-4" style={{ borderColor: previewColor }}>
              <Text className="text-sm text-muted mb-1">Preview Perubahan</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-ink">{formattedCurrent}</Text>
                <Text style={{ color: previewColor }} className="text-xl font-bold">
                  {numericAmount > 0 ? '→' : '←'} {formattedNew}
                </Text>
              </View>
            </View>
          )}

          <Button
            label="Konfirmasi Penyesuaian"
            onPress={onConfirmPress}
            disabled={!selectedUser || numericAmount === 0 || !reason}
            loading={isSubmitting}
          />
        </Card>
      )}

      {/* User Picker Modal */}
      <Modal visible={showUserPicker} animationType="slide" onRequestClose={() => setShowUserPicker(false)}>
        <View className="flex-1 bg-background pt-12">
          <View className="flex-row items-center px-4 pb-3 gap-3 border-b border-border bg-surface">
            <Pressable onPress={() => setShowUserPicker(false)} className="p-1">
              <Text className="text-lg text-primary-600 font-semibold">Batal</Text>
            </Pressable>
            <Text className="flex-1 text-lg font-bold text-ink text-center">Pilih User</Text>
            <View className="w-8" />
          </View>

          <View className="px-4 py-3">
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Cari nama atau nomor HP..."
              placeholderTextColor="#9CA3AF"
              className="min-h-[52px] rounded-button border-2 border-border bg-surface px-4 text-base text-ink"
            />
          </View>

          {isSearching ? (
            <View className="items-center py-8"><ActivityIndicator color="#16A34A" /></View>
          ) : users.length === 0 && debouncedSearch.length >= 2 ? (
            <EmptyState title="User tidak ditemukan" subtitle="Coba kata kunci lain" />
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => selectUser(item)}
                  className="px-4 py-4 border-b border-border bg-surface"
                >
                  <Text className="text-base font-semibold text-ink">{item.fullName}</Text>
                  <Text className="text-sm text-muted">{item.phoneNumber}</Text>
                  <Text className="text-sm text-primary-600 font-semibold mt-1">
                    Saldo: {formatCurrency(Number(item.savingAccount?.currentBalance ?? 0))}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <View className="items-center py-8">
                  <Text className="text-muted">Ketik nama atau nomor HP untuk mencari</Text>
                </View>
              }
              contentContainerClassName="pb-8"
            />
          )}
        </View>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={showConfirm}
        title="Konfirmasi Penyesuaian"
        message={`Yakin ingin menyesuaikan saldo ${selectedUser?.fullName} sebesar ${numericAmount > 0 ? '+' : ''}${formatCurrency(numericAmount)}?\n\nAlasan: ${reason}`}
        confirmLabel="Ya, Sesuaikan"
        onConfirm={onSubmit}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade" onRequestClose={onReset}>
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="bg-surface rounded-card p-6 w-full max-w-sm items-center">
            <Text className="text-5xl mb-3">✅</Text>
            <Text className="text-xl font-bold text-ink mb-2 text-center">Saldo Berhasil Disesuaikan</Text>
            <Text className="text-base text-muted text-center mb-4">
              Saldo baru: <Text className="font-bold text-ink">{formatCurrency(adjustmentResult?.newBalance ?? 0)}</Text>
            </Text>
            <Button label="Sesuaikan Lagi" onPress={onReset} variant="primary" />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
