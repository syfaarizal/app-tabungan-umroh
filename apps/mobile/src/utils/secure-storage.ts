import * as SecureStore from 'expo-secure-store';

/**
 * Thin wrapper around Expo SecureStore so token storage has one call site.
 * Tokens are never kept in JS memory-only state across app restarts.
 */
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

export const STORAGE_KEYS = {
  accessToken: 'tu_access_token',
  refreshToken: 'tu_refresh_token',
  authUser: 'tu_auth_user',
} as const;
