import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '@/utils/storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ 401 Unauthorized — Token expired atau invalid');
      await storage.clearAll();
      if (onUnauthorized) {
        onUnauthorized();
      }
    }
    if (!error.response) {
      console.error('❌ Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.status === 401) {
      return 'Session expired. Silakan login ulang.';
    }
    if (axiosError.response?.status === 403) {
      return 'Akses ditolak.';
    }
    if (axiosError.response?.status === 404) {
      return 'Data tidak ditemukan.';
    }
    if (axiosError.response?.status === 500) {
      return 'Server error. Coba lagi nanti.';
    }
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timeout. Periksa koneksi Anda.';
    }
    if (axiosError.code === 'ERR_NETWORK') {
      return 'Tidak dapat terhubung ke server. Periksa koneksi.';
    }
    return axiosError.message || 'Terjadi kesalahan.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Terjadi kesalahan tidak dikenal.';
};
