import { apiClient } from './client';
import type {
  ApiResponse,
  Asset,
  AssetStatistics,
  CreateAssetRequest,
  PaginatedResponse,
} from '@/types';

export const assetApi = {
  /**
   * List semua aset dengan search, filter, pagination
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
  }): Promise<PaginatedResponse<Asset>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Asset>>>(
      '/api/assets',
      { params }
    );
    return response.data.data;
  },

  /**
   * Detail aset by ID
   */
  async getById(id: number): Promise<Asset> {
    const response = await apiClient.get<ApiResponse<Asset>>(`/api/assets/${id}`);
    return response.data.data;
  },

  /**
   * Statistik aset (untuk dashboard)
   */
  async getStatistics(): Promise<AssetStatistics> {
    const response = await apiClient.get<ApiResponse<AssetStatistics>>(
      '/api/assets/statistics'
    );
    return response.data.data;
  },

  /**
   * Create aset baru (admin only)
   */
  async create(data: CreateAssetRequest): Promise<Asset> {
    const response = await apiClient.post<ApiResponse<Asset>>('/api/assets', data);
    return response.data.data;
  },

  /**
   * Update aset (admin only)
   */
  async update(id: number, data: Partial<CreateAssetRequest>): Promise<Asset> {
    const response = await apiClient.put<ApiResponse<Asset>>(
      `/api/assets/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete aset (admin only)
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/assets/${id}`);
  },
};
