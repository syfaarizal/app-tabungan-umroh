import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { useCreateDepositRequest } from '../../src/hooks/useTransactions';
import { formatCurrency, formatDate } from '../../src/utils/format';

const QUICK_AMOUNTS = [100_000, 200_000, 500_000, 1_000_000];

export default function SetorScreen() {
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending, isSuccess, reset } = useCreateDepositRequest();

  const today = new Date().toISOString();

  const handleAddQuick = (value: number) => setAmount((prev) => prev + value);

  const handleSubmit = async () => {
    setError(null);
    if (amount < 1000) {
      setError('Masukkan nominal setoran minimal Rp1.000');
      return;
    }
    try {
      await mutateAsync({ amount, note: note || undefined });
    } catch {
      setError('Gagal mengirim setoran. Silakan coba lagi.');
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={56} color="#16A34A" />
        </View>
        <Text className="text-2xl font-extrabold text-ink text-center mb-2">
          Setoran Terkirim
        </Text>
        <Text className="text-base text-muted text-center mb-8">
          Setoran sebesar {formatCurrency(amount)} akan dicatat setelah dikonfirmasi admin.
        </Text>
        <Button
          label="Kembali ke Beranda"
          onPress={() => {
            reset();
            setAmount(0);
            setNote('');
            router.replace('/(user)/dashboard');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-5 py-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="chevron-back" size={26} color="#1F2937" />
        </Pressable>
        <Text className="text-xl font-bold text-ink">Setor Tabungan</Text>
      </View>

      <ScrollView contentContainerClassName="px-5 py-6" keyboardShouldPersistTaps="handled">
        <Text className="text-base font-semibold text-ink mb-2">Masukkan Nominal</Text>
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
              onPress={() => handleAddQuick(value)}
              className="px-4 py-2 rounded-full bg-primary-100"
            >
              <Text className="text-primary-700 font-semibold">
                +{value >= 1_000_000 ? `${value / 1_000_000}JT` : `${value / 1000}RB`}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextField label="Tanggal" value={formatDate(today)} editable={false} />

        <TextField
          label="Keterangan (Opsional)"
          placeholder="Contoh: Setoran rutin"
          value={note}
          onChangeText={setNote}
        />

        {error ? <Text className="text-danger text-base mb-4 text-center">{error}</Text> : null}

        <Button label="Kirim ke Admin" onPress={handleSubmit} loading={isPending} />

        <View className="bg-primary-50 rounded-card p-4 mt-4">
          <Text className="text-primary-700 text-sm text-center">
            Setoran akan dicatat setelah dikonfirmasi oleh admin.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
