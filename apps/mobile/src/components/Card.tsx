import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <View className={`bg-surface rounded-card p-5 shadow-sm border border-border ${className}`}>
      {children}
    </View>
  );
}
