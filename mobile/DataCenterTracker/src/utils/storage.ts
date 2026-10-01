import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Runtime check — dipanggil setiap saat, bukan di-cache
const isWebRuntime = (): boolean => {
  return typeof window !== 'undefined' && !!window.localStorage;
};

export const storage = {
  async setToken(token: string): Promise<void> {
    if (isWebRuntime()) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  },

  async getToken(): Promise<string | null> {
    if (isWebRuntime()) {
      return window.localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    if (isWebRuntime()) {
      window.localStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  },

  async setUser(user: any): Promise<void> {
    const json = JSON.stringify(user);
    if (isWebRuntime()) {
      window.localStorage.setItem(USER_KEY, json);
    } else {
      await SecureStore.setItemAsync(USER_KEY, json);
    }
  },

  async getUser(): Promise<any | null> {
    let json: string | null;
    if (isWebRuntime()) {
      json = window.localStorage.getItem(USER_KEY);
    } else {
      json = await SecureStore.getItemAsync(USER_KEY);
    }
    return json ? JSON.parse(json) : null;
  },

  async removeUser(): Promise<void> {
    if (isWebRuntime()) {
      window.localStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  },

  async clearAll(): Promise<void> {
    if (isWebRuntime()) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  },
};
