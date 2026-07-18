import { useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '../../constants/colors';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartChange: (date: Date | null) => void;
  onEndChange: (date: Date | null) => void;
}

export function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }: DateRangePickerProps) {
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Pilih tanggal';
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const onStartSelect = (_: DateTimePickerEvent, date?: Date) => {
    setShowStart(Platform.OS === 'ios');
    if (date) onStartChange(date);
  };

  const onEndSelect = (_: DateTimePickerEvent, date?: Date) => {
    setShowEnd(Platform.OS === 'ios');
    if (date) onEndChange(date);
  };

  return (
    <View className="gap-2 mb-4">
      <View className="flex-row gap-2">
        <Pressable onPress={() => setShowStart(true)} className="flex-1 border border-border rounded-button px-3 py-3 bg-surface">
          <Text className="text-xs text-muted mb-1">Dari Tanggal</Text>
          <Text className="text-base text-ink">{formatDate(startDate)}</Text>
        </Pressable>
        <Pressable onPress={() => setShowEnd(true)} className="flex-1 border border-border rounded-button px-3 py-3 bg-surface">
          <Text className="text-xs text-muted mb-1">Sampai Tanggal</Text>
          <Text className="text-base text-ink">{formatDate(endDate)}</Text>
        </Pressable>
      </View>

      {(startDate || endDate) && (
        <Pressable onPress={() => { onStartChange(null); onEndChange(null); }} className="self-start">
          <Text className="text-sm text-primary-600 font-semibold">Reset Filter</Text>
        </Pressable>
      )}

      {showStart && (
        <DateTimePicker
          value={startDate ?? new Date()}
          mode="date"
          display="default"
          maximumDate={endDate ?? undefined}
          onChange={onStartSelect}
        />
      )}
      {showEnd && (
        <DateTimePicker
          value={endDate ?? new Date()}
          mode="date"
          display="default"
          minimumDate={startDate ?? undefined}
          maximumDate={new Date()}
          onChange={onEndSelect}
        />
      )}
    </View>
  );
}
