import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { ConfirmDialog } from '../../../src/components/ConfirmDialog';
import { ErrorState } from '../../../src/components/ErrorState';
import { LoadingState } from '../../../src/components/LoadingState';
import { TextField } from '../../../src/components/TextField';
import { useDeleteUser, useUpdateUser, useUser } from '../../../src/hooks/useUsers';
import { formatCurrency } from '../../../src/utils/format';

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user, isLoading, isError, refetch } = useUser(id);
  const updateUser = useUpdateUser(id ?? '');
  const deleteUser = useDeleteUser();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const startEditing = () => {
    setFullName(user?.fullName ?? '');
    setTargetAmount(String(user?.savingAccount?.targetAmount ?? ''));
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateUser.mutateAsync({ fullName });
    setIsEditing(false);
    refetch();
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteUser.mutateAsync(id);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-5 py-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="chevron-back" size={26} color="#1F2937" />
        </Pressable>
        <Text className="text-xl font-bold text-ink">Detail User</Text>
      </View>

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState onRetry={refetch} /> : null}

      {user ? (
        <ScrollView contentContainerClassName="px-5 py-6">
          <Card className="items-center py-6 mb-6">
            <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3">
              <Ionicons name="person" size={36} color="#16A34A" />
            </View>
            {isEditing ? (
              <TextField label="Nama Lengkap" value={fullName} onChangeText={setFullName} />
            ) : (
              <Text className="text-lg font-bold text-ink">{user.fullName}</Text>
            )}
            <Text className="text-base text-muted">{user.phoneNumber}</Text>
          </Card>

          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-surface rounded-card p-4 border border-border">
              <Text className="text-sm text-muted mb-1">Saldo</Text>
              <Text className="text-lg font-bold text-primary-700">
                {formatCurrency(user.savingAccount?.currentBalance ?? 0)}
              </Text>
            </View>
            <View className="flex-1 bg-surface rounded-card p-4 border border-border">
              <Text className="text-sm text-muted mb-1">Target</Text>
              <Text className="text-lg font-bold text-ink">
                {formatCurrency(user.savingAccount?.targetAmount ?? 0)}
              </Text>
            </View>
          </View>

          {isEditing ? (
            <View className="gap-3">
              <Button label="Simpan Perubahan" onPress={handleSave} loading={updateUser.isPending} />
              <Button label="Batal" variant="secondary" onPress={() => setIsEditing(false)} />
            </View>
          ) : (
            <View className="gap-3">
              <Button
                label="+ Catat Setoran"
                onPress={() =>
                  router.push({ pathname: '/(admin)/transactions/create', params: { userId: user.id } })
                }
              />
              <Button label="Edit User" variant="outline" onPress={startEditing} />
              <Button
                label="Hapus User"
                variant="outline"
                onPress={() => setShowDeleteConfirm(true)}
              />
            </View>
          )}
        </ScrollView>
      ) : null}

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Hapus User"
        message={`Yakin ingin menghapus ${user?.fullName}? Data histori tetap tersimpan.`}
        confirmLabel="Ya, Hapus"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </SafeAreaView>
  );
}
