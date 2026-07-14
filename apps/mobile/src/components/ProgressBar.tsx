import React from 'react';
import { View } from 'react-native';

export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View className="h-3 w-full rounded-full bg-white/30 overflow-hidden">
      <View style={{ width: `${clamped}%` }} className="h-full bg-white rounded-full" />
    </View>
  );
}
