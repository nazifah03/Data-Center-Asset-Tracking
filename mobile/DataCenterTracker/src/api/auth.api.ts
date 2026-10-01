import { apiClient } from './client';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from '@/types';

export const authApi = {
  /**
   * Login dengan username & password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/auth/login',
      data
    );
    return response.data.data;
  },

  /**
   * Register user baru (untuk admin)
   */
  async register(data: RegisterRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(
      '/api/auth/register',
      data
    );
    return response.data.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/api/auth/me');
    return response.data.data;
  },
};
