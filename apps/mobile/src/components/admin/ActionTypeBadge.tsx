import { Text, View } from 'react-native';
import { AuditActionType } from '../../types';

const ACTION_CONFIG: Record<AuditActionType, { label: string; bg: string; text: string }> = {
  CREATE_USER:         { label: 'Buat User',       bg: '#DBEAFE', text: '#1D4ED8' },
  LOGIN:               { label: 'Login',            bg: '#F3F4F6', text: '#374151' },
  CREATE_TRANSACTION:  { label: 'Transaksi Baru',  bg: '#F3F4F6', text: '#374151' },
  CONFIRM_TRANSACTION: { label: 'Konfirmasi',      bg: '#D1FAE5', text: '#065F46' },
  REJECT_TRANSACTION:  { label: 'Tolak',           bg: '#FEE2E2', text: '#991B1B' },
  DELETE_TRANSACTION:  { label: 'Hapus',           bg: '#FEE2E2', text: '#7F1D1D' },
  MANUAL_ADJUSTMENT:   { label: 'Sesuaikan Saldo', bg: '#FEF3C7', text: '#92400E' },
};

interface ActionTypeBadgeProps {
  actionType: AuditActionType;
  size?: 'sm' | 'md';
}

export function ActionTypeBadge({ actionType, size = 'md' }: ActionTypeBadgeProps) {
  const config = ACTION_CONFIG[actionType] ?? ACTION_CONFIG.LOGIN;
  const isSm = size === 'sm';

  return (
    <View style={{ backgroundColor: config.bg }} className="rounded-full px-2.5 py-1 self-start">
      <Text
        style={{ color: config.text }}
        className={`font-semibold ${isSm ? 'text-xs' : 'text-xs'}`}
        numberOfLines={1}
      >
        {config.label}
      </Text>
    </View>
  );
}
