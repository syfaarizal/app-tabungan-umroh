import { Pressable, Text, View } from 'react-native';
import { AuditLogEntry } from '../../types';
import { formatCurrency } from '../../utils/format';
import { ActionTypeBadge } from './ActionTypeBadge';

interface AuditLogRowProps {
  item: AuditLogEntry;
  onPress?: (item: AuditLogEntry) => void;
}

export function AuditLogRow({ item, onPress }: AuditLogRowProps) {
  const formattedDate = new Date(item.createdAt).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const formattedTime = new Date(item.createdAt).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit',
  });

  const targetLabel = item.targetUser?.fullName
    ?? item.targetTransaction?.id?.slice(0, 8)
    ?? '-';

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      className="bg-surface border-b border-border px-4 py-4"
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-sm text-muted">{formattedDate} · {formattedTime}</Text>
          <Text className="text-base font-semibold text-ink mt-0.5">
            {item.performedBy.fullName}
          </Text>
        </View>
        <ActionTypeBadge actionType={item.actionType} size="sm" />
      </View>

      {item.targetUser && (
        <Text className="text-sm text-muted">Target: {item.targetUser.fullName}</Text>
      )}

      {item.amount != null && Number(item.amount) !== 0 && (
        <Text className="text-sm font-semibold mt-1">
          Jumlah: {formatCurrency(Number(item.amount))}
        </Text>
      )}

      {item.reason && (
        <Text className="text-xs text-muted mt-1 italic" numberOfLines={2}>
          "{item.reason}"
        </Text>
      )}
    </Pressable>
  );
}
