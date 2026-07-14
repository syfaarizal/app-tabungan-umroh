import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../../src/components/EmptyState';
import { ErrorState } from '../../../src/components/ErrorState';
import { LoadingState } from '../../../src/components/LoadingState';
import { useDebounce } from '../../../src/hooks/useDebounce';
import { useUsers } from '../../../src/hooks/useUsers';
import { UserListItem } from '../../../src/types';
import { formatCurrency } from '../../../src/utils/format';

export default function KelolaUserScreen() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading, isError, refetch } = useUsers({ search: debouncedSearch });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 py-4 border-b border-border">
        <Text className="text-xl font-bold text-ink mb-3">Kelola User</Text>

        <View className="flex-row items-center bg-surface border border-border rounded-button px-3 mb-3 h-14">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari nama atau nomor HP..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-base text-ink"
          />
        </View>

        <Pressable
          onPress={() => router.push('/(admin)/users/create')}
          className="bg-primary-600 rounded-button py-4 items-center min-h-[56px] justify-center"
        >
          <Text className="text-white text-lg font-bold">+ Tambah User</Text>
        </Pressable>
      </View>

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState onRetry={refetch} /> : null}

      {!isLoading && !isError ? (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 py-4"
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListEmptyComponent={<EmptyState title="Tidak ada user ditemukan" />}
          renderItem={({ item }) => <UserRow user={item} />}
        />
      ) : null}
    </SafeAreaView>
  );
}

function UserRow({ user }: { user: UserListItem }) {
  return (
    <Pressable
      onPress={() => router.push(`/(admin)/users/${user.id}` as never)}
      className="bg-surface rounded-card p-4 border border-border flex-row items-center gap-3"
    >
      <View className="w-11 h-11 rounded-full bg-primary-100 items-center justify-center">
        <Ionicons name="person" size={20} color="#16A34A" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink">{user.fullName}</Text>
        <Text className="text-sm text-muted">{user.phoneNumber}</Text>
      </View>
      <View className="items-end">
        <Text className="text-base font-bold text-primary-700">
          {formatCurrency(user.savingAccount?.currentBalance ?? 0)}
        </Text>
        <Text className="text-xs text-muted">Saldo</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </Pressable>
  );
}
