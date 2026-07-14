import { create } from 'zustand';
import { loginRequest, logoutRequest, LoginPayload } from '../api/auth.api';
import { AuthUser } from '../types';
import { STORAGE_KEYS, secureStorage } from '../utils/secure-storage';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    const [token, userJson] = await Promise.all([
      secureStorage.getItem(STORAGE_KEYS.accessToken),
      secureStorage.getItem(STORAGE_KEYS.authUser),
    ]);
    set({
      user: token && userJson ? (JSON.parse(userJson) as AuthUser) : null,
      isHydrated: true,
    });
  },

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const result = await loginRequest(payload);
      await Promise.all([
        secureStorage.setItem(STORAGE_KEYS.accessToken, result.accessToken),
        secureStorage.setItem(STORAGE_KEYS.refreshToken, result.refreshToken),
        secureStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(result.user)),
      ]);
      set({ user: result.user, isLoading: false });
      return result.user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const refreshToken = await secureStorage.getItem(STORAGE_KEYS.refreshToken);
    try {
      if (refreshToken) await logoutRequest(refreshToken);
    } catch {
      // Best-effort: proceed with local logout even if the network call fails
    }
    await Promise.all([
      secureStorage.removeItem(STORAGE_KEYS.accessToken),
      secureStorage.removeItem(STORAGE_KEYS.refreshToken),
      secureStorage.removeItem(STORAGE_KEYS.authUser),
    ]);
    set({ user: null });
    void get();
  },
}));
