import React from 'react';
import { Text, View } from 'react-native';

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="items-center justify-center py-16 px-6">
      <Text className="text-5xl mb-3">🗂️</Text>
      <Text className="text-lg font-bold text-ink text-center">{title}</Text>
      {subtitle ? <Text className="text-base text-muted text-center mt-1">{subtitle}</Text> : null}
    </View>
  );
}
