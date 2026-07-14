import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export function LoadingState() {
  return (
    <View className="items-center justify-center py-16">
      <ActivityIndicator size="large" color="#16A34A" />
    </View>
  );
}
