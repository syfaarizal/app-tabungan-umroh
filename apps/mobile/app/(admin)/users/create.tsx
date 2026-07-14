import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Button } from '../../../src/components/Button';
import { TextField } from '../../../src/components/TextField';
import { useCreateUser } from '../../../src/hooks/useUsers';

const schema = z.object({
  fullName: z.string().min(3, 'Nama minimal 3 karakter'),
  phoneNumber: z.string().min(9, 'Nomor HP tidak valid'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  targetAmount: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateUserScreen() {
  const createUser = useCreateUser();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await createUser.mutateAsync({
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        email: values.email || undefined,
        password: values.password,
        targetAmount: values.targetAmount ? Number(values.targetAmount) : undefined,
      });
      router.back();
    } catch {
      setServerError('Gagal menambahkan user. Nomor HP mungkin sudah terdaftar.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-5 py-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="chevron-back" size={26} color="#1F2937" />
        </Pressable>
        <Text className="text-xl font-bold text-ink">Tambah User</Text>
      </View>

      <ScrollView contentContainerClassName="px-5 py-6" keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="fullName"
          render={({ field }) => (
            <TextField
              label="Nama Lengkap"
              placeholder="Contoh: Ahmad"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.fullName?.message}
            />
          )}
        />
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
          name="email"
          render={({ field }) => (
            <TextField
              label="Email (Opsional)"
              placeholder="nama@email.com"
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextField
              label="Password Awal"
              placeholder="Minimal 6 karakter"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="targetAmount"
          render={({ field }) => (
            <TextField
              label="Target Tabungan (Opsional)"
              placeholder="25000000"
              keyboardType="number-pad"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        {serverError ? (
          <Text className="text-danger text-base mb-4 text-center">{serverError}</Text>
        ) : null}

        <Button label="Simpan User" onPress={handleSubmit(onSubmit)} loading={createUser.isPending} />
      </ScrollView>
    </SafeAreaView>
  );
}
