import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Large, high-contrast tap target (min 56px height) — sized for elderly users.
 */
export function Button({ label, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const base = 'w-full rounded-button py-4 items-center justify-center min-h-[56px]';
  const variants: Record<string, string> = {
    primary: 'bg-primary-600 active:bg-primary-700',
    secondary: 'bg-primary-100 active:bg-primary-100',
    outline: 'bg-transparent border-2 border-primary-600',
  };
  const textVariants: Record<string, string> = {
    primary: 'text-white',
    secondary: 'text-primary-700',
    outline: 'text-primary-700',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#15803D'} />
      ) : (
        <Text className={`text-lg font-bold ${textVariants[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
