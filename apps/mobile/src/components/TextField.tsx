import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-ink mb-2">{label}</Text>
      <TextInput
        {...inputProps}
        onFocus={(e) => {
          setIsFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          inputProps.onBlur?.(e);
        }}
        placeholderTextColor="#9CA3AF"
        className={`min-h-[56px] rounded-button border-2 px-4 text-lg text-ink bg-surface ${
          error ? 'border-danger' : isFocused ? 'border-primary-600' : 'border-border'
        }`}
      />
      {error ? <Text className="text-danger text-sm mt-1">{error}</Text> : null}
    </View>
  );
}
