import { Pressable, Text, View } from 'react-native';
import { LedgerEntry } from '../../types';
import { formatCurrency } from '../../utils/format';

interface TransactionRowProps {
  item: LedgerEntry;
  onPress?: (item: LedgerEntry) => void;
}

export function TransactionRow({ item, onPress }: TransactionRowProps) {
  const isDeposit = item.type === 'DEPOSIT';
  const amountColor = isDeposit ? '#10B981' : '#EF4444';
  const amountPrefix = isDeposit ? '+' : '-';

  const formattedDate = new Date(item.transactionDate).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const formattedAmount = formatCurrency(Number(item.amount));
  const formattedCumulative = formatCurrency(item.cumulativeBalance);

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      className="bg-surface border-b border-border px-4 py-4 flex-row items-center"
    >
      <View className="flex-1">
        <Text className="text-sm text-muted">{formattedDate}</Text>
        <Text className="text-base font-semibold text-ink mt-0.5">
          {item.savingAccount?.user?.fullName ?? '-'}
        </Text>
        {item.recordedByAdmin && (
          <Text className="text-xs text-muted mt-0.5">oleh: {item.recordedByAdmin.fullName}</Text>
        )}
        {item.note && <Text className="text-xs text-muted mt-0.5" numberOfLines={1}>{item.note}</Text>}
      </View>
      <View className="items-end">
        <Text style={{ color: amountColor }} className="text-base font-bold">
          {amountPrefix}{formattedAmount}
        </Text>
        <Text className="text-sm text-muted mt-1">Saldo: {formattedCumulative}</Text>
      </View>
    </Pressable>
  );
}
