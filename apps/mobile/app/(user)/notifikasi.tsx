import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/EmptyState';
import { ErrorState } from '../../src/components/ErrorState';
import { LoadingState } from '../../src/components/LoadingState';
import { useMarkNotificationRead, useMyNotifications } from '../../src/hooks/useNotifications';
import { AppNotification } from '../../src/types';
import { formatDate } from '../../src/utils/format';

export default function NotifikasiScreen() {
  const { data, isLoading, isError, refetch } = useMyNotifications();
  const markAsRead = useMarkNotificationRead();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 py-4 border-b border-border">
        <Text className="text-xl font-bold text-ink">Notifikasi</Text>
      </View>

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState onRetry={refetch} /> : null}

      {!isLoading && !isError ? (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 py-4"
          ListEmptyComponent={<EmptyState title="Belum ada notifikasi" />}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <NotificationRow notification={item} onPress={() => markAsRead.mutate(item.id)} />
          )}
        />
      ) : null}
    </SafeAreaView>
  );
}

function NotificationRow({
  notification,
  onPress,
}: {
  notification: AppNotification;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-card p-4 border flex-row gap-3 ${
        notification.isRead ? 'bg-surface border-border' : 'bg-primary-50 border-primary-100'
      }`}
    >
      <Ionicons
        name={notification.isRead ? 'checkmark-circle-outline' : 'notifications'}
        size={22}
        color="#16A34A"
      />
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink">{notification.title}</Text>
        <Text className="text-sm text-muted mt-0.5">{notification.message}</Text>
        <Text className="text-xs text-muted mt-1">{formatDate(notification.createdAt)}</Text>
      </View>
    </Pressable>
  );
}
