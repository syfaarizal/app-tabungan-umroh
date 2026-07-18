import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ControlledTextField } from '../../src/components/TextField';
import { Button } from '../../src/components/Button';
import { useAuthStore } from '../../src/store/auth.store';

const schema = z.object({
  phoneNumber: z.string().min(9, 'Nomor HP tidak valid').max(15, 'Nomor HP terlalu panjang'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phoneNumber: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const user = await login(values);
      if (user.role !== 'USER') {
        setServerError('Akun ini terdaftar sebagai Admin.');
        return;
      }
      router.replace('/(user)/dashboard');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? '')
          : '';
      if (message.includes('tidak terdaftar')) {
        setServerError('Nomor HP tidak terdaftar');
      } else {
        setServerError('Gagal masuk. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow px-6 py-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-10 mt-4">
          <View className="w-24 h-24 rounded-3xl bg-primary-100 items-center justify-center mb-5">
            <Text className="text-5xl">🕌</Text>
          </View>
          <Text className="text-2xl font-extrabold text-ink">Assalamu&apos;alaikum</Text>
          <Text className="text-base text-muted mt-2 text-center">
            Masukkan nomor HP Anda untuk masuk
          </Text>
        </View>

        {/* Phone Input */}
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field }) => (
            <ControlledTextField<FormValues>
              label="Nomor HP"
              control={control}
              name="phoneNumber"
              placeholder="Contoh: 081234567890"
              keyboardType="phone-pad"
              error={errors.phoneNumber?.message}
            />
          )}
        />

        {/* Server Error */}
        {serverError ? (
          <View className="bg-danger/10 rounded-card px-4 py-3 mb-4">
            <Text className="text-danger text-base text-center font-semibold">
              {serverError}
            </Text>
          </View>
        ) : null}

        {/* Submit Button */}
        <Button
          label="Masuk"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
        />

        {/* Help Text */}
        <View className="mt-10 items-center">
          <Text className="text-muted text-base text-center">Belum punya akun?</Text>
          <Text className="text-primary-700 text-base font-semibold mt-1">
            Hubungi admin untuk mendaftar
          </Text>
        </View>

        {/* Admin Link */}
        <Pressable
          onPress={() => router.push('/(auth)/admin-login')}
          className="flex-row items-center justify-center gap-1.5 mt-6"
        >
          <AntDesign name="lock" size={15} color="#6B7280" />
          <Text className="text-muted text-sm underline">Masuk sebagai Admin</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
