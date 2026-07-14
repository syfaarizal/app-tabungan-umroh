import React from 'react';
import { Modal, Text, View } from 'react-native';
import { Button } from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  danger,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/40 items-center justify-center px-6">
        <View className="bg-surface rounded-card p-6 w-full max-w-sm">
          <Text className="text-xl font-bold text-ink mb-2">{title}</Text>
          <Text className="text-base text-muted mb-6">{message}</Text>
          <View className="gap-3">
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              variant={danger ? 'outline' : 'primary'}
            />
            <Button label={cancelLabel} onPress={onCancel} variant="secondary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
