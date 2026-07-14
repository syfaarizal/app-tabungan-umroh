import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onHide: () => void;
}

export function Toast({ message, type = 'success', onHide }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onHide, 2500);
    return () => clearTimeout(timer);
  }, [message, onHide]);

  if (!message) return null;

  return (
    <View
      className={`absolute bottom-8 left-6 right-6 rounded-button px-4 py-4 ${
        type === 'success' ? 'bg-primary-600' : 'bg-danger'
      }`}
    >
      <Text className="text-white text-base font-semibold text-center">{message}</Text>
    </View>
  );
}
