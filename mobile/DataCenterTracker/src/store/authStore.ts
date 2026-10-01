import { create } from 'zustand';
import { authApi } from '@/api/auth.api';
import { storage } from '@/utils/storage';
import { setUnauthorizedHandler } from '@/api/client';
import type { LoginRequest, User } from '@/types';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  /**
   * Login user
   */
  login: async (data: LoginRequest) => {
    try {
      set({ isLoading: true });

      const response = await authApi.login(data);

      // Simpan ke storage
      await storage.setToken(response.token);
      await storage.setUser(response.user);

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await storage.clearAll();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Load token & user dari storage saat app start
   */
  loadFromStorage: async () => {
  console.log('🚀 loadFromStorage START');
  try {
    set({ isLoading: true });
    console.log('📦 Reading storage...');

    const token = await storage.getToken();
    console.log('🔑 Token:', token ? `EXISTS (${token.slice(0, 20)}...)` : 'NULL');

    const user = await storage.getUser();
    console.log('👤 User:', user ? `EXISTS (${user.username})` : 'NULL');

    if (token && user) {
      set({ token, user, isAuthenticated: true, isLoading: false });
      console.log('✅ Authenticated');
    } else {
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      console.log('🔓 Not authenticated');
    }
  } catch (error) {
    console.error('❌ loadFromStorage ERROR:', error);
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  }
  console.log('🏁 loadFromStorage END');
},

  /**
   * Update user data (untuk refresh profile)
   */
  setUser: (user: User) => {
    set({ user });
    storage.setUser(user);
  },
}));

/**
 * Setup unauthorized handler untuk auto logout
 * Dipanggil sekali saat app start
 */
export const setupAuthInterceptor = () => {
  setUnauthorizedHandler(() => {
    useAuthStore.getState().logout();
  });
};
