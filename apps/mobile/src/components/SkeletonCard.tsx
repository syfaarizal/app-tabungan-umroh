import React from 'react';
import { View } from 'react-native';

export function SkeletonCard() {
  return (
    <View className="bg-surface rounded-card p-5 border border-border mb-3">
      <View className="h-4 w-1/3 bg-primary-100 rounded mb-3" />
      <View className="h-6 w-2/3 bg-primary-100 rounded" />
    </View>
  );
}
