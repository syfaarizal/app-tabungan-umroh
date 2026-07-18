import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

export interface ControlledTextFieldProps<T extends FieldValues> {
  label: string;
  control: Control<T>;
  name: Path<T>;
  error?: string;
}

export function ControlledTextField<T extends FieldValues>({
  label,
  control,
  name,
  error,
  ...inputProps
}: ControlledTextFieldProps<T> & Omit<TextInputProps, 'value' | 'onChangeText'>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <_TextField
          label={label}
          error={error}
          value={field.value as string}
          onChangeText={field.onChange}
          {...inputProps}
        />
      )}
    />
  );
}

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  return <_TextField label={label} error={error} {...inputProps} />;
}

function _TextField({
  label,
  error,
  value,
  onChangeText,
  ...inputProps
}: {
  label: string;
  error?: string;
  value?: string;
  onChangeText?: (text: string) => void;
} & Omit<TextInputProps, 'value' | 'onChangeText'>) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-ink mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
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
