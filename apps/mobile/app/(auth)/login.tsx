import { zodResolver } from '@hookform/resolvers/zod';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { useAuthStore } from '../../src/store/auth.store';

const schema = z.object({
  phoneNumber: z.string().min(9, 'Nomor HP tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const user = await login(values);
      if (user.role !== 'USER') {
        setServerError('Akun ini terdaftar sebagai Admin. Gunakan halaman Login Admin.');
        return;
      }
      router.replace('/(user)/dashboard');
    } catch {
      setServerError('Nomor HP atau password salah');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow px-6 py-8" keyboardShouldPersistTaps="handled">
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-2xl bg-primary-100 items-center justify-center mb-4">
            <Text className="text-4xl">🕌</Text>
          </View>
          <Text className="text-2xl font-extrabold text-ink">Selamat Datang</Text>
          <Text className="text-base text-muted mt-1">Masuk untuk melanjutkan</Text>
        </View>

        <Controller
          control={control}
          name="phoneNumber"
          render={({ field }) => (
            <TextField
              label="Nomor HP"
              placeholder="08xxxxxxxxxx"
              keyboardType="phone-pad"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.phoneNumber?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextField
              label="Password"
              placeholder="Masukkan password"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              error={errors.password?.message}
            />
          )}
        />

        {serverError ? (
          <Text className="text-danger text-base mb-4 text-center">{serverError}</Text>
        ) : null}

        <Button label="Masuk" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

        <View className="mt-8 items-center gap-3">
          <Text className="text-muted text-base">
            Belum punya akun? <Text className="text-primary-700 font-semibold">Hubungi admin</Text>
          </Text>
          <Pressable
            onPress={() => router.push('/(auth)/admin-login')}
            className="flex-row items-center gap-1 mt-2"
          >
            <AntDesign name="lock" size={16} color="#6B7280" />
            <Text className="text-muted text-base underline">Masuk sebagai Admin</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
