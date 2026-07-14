import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { useChangePassword } from '../hooks/useProfile';
import { useAuthStore } from '../store/auth.store';
import { Button } from './Button';
import { Card } from './Card';
import { ConfirmDialog } from './ConfirmDialog';
import { TextField } from './TextField';
import { Toast } from './Toast';

const schema = z
  .object({
    currentPassword: z.string().min(6, 'Password saat ini wajib diisi'),
    newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function ProfileScreen({ loginRoute }: { loginRoute: string }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const changePasswordMutation = useChangePassword();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      setToast('Password berhasil diubah');
    } catch {
      setToast('Password saat ini salah');
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    router.replace(loginRoute as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 py-6">
        <Text className="text-xl font-bold text-ink mb-4">Profil</Text>

        <Card className="mb-6 items-center py-6">
          <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3">
            <Ionicons name="person" size={36} color="#16A34A" />
          </View>
          <Text className="text-lg font-bold text-ink">{user?.fullName}</Text>
          <Text className="text-base text-muted">{user?.phoneNumber}</Text>
        </Card>

        <Text className="text-lg font-bold text-ink mb-3">Ubah Password</Text>
        <Controller
          control={control}
          name="currentPassword"
          render={({ field }) => (
            <TextField
              label="Password Saat Ini"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              error={errors.currentPassword?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="newPassword"
          render={({ field }) => (
            <TextField
              label="Password Baru"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              error={errors.newPassword?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <TextField
              label="Konfirmasi Password Baru"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              error={errors.confirmPassword?.message}
            />
          )}
        />
        <Button
          label="Simpan Password"
          onPress={handleSubmit(onSubmit)}
          loading={changePasswordMutation.isPending}
        />

        <View className="mt-8">
          <Button label="Keluar" variant="outline" onPress={() => setShowLogoutConfirm(true)} />
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

      <Toast message={toast} onHide={() => setToast(null)} />
    </SafeAreaView>
  );
}
