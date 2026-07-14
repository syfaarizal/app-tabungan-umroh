import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View className="items-center justify-center py-16 px-6">
      <Text className="text-5xl mb-3">⚠️</Text>
      <Text className="text-lg font-bold text-ink text-center">Terjadi Kesalahan</Text>
      <Text className="text-base text-muted text-center mt-1 mb-4">
        {message ?? 'Gagal memuat data. Periksa koneksi internet Anda.'}
      </Text>
      {onRetry ? <Button label="Coba Lagi" onPress={onRetry} variant="outline" /> : null}
    </View>
  );
}
