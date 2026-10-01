import { apiClient } from './client';
import type { ApiResponse, AiPrediction, RiskSummary } from '@/types';

export const aiApi = {
  /**
   * Ringkasan risiko untuk dashboard
   */
  async getRiskSummary(): Promise<RiskSummary> {
    const response = await apiClient.get<ApiResponse<RiskSummary>>(
      '/api/ai/risk-summary'
    );
    return response.data.data;
  },

  /**
   * List semua prediksi
   */
  async getPredictions(params?: {
    page?: number;
    limit?: number;
    riskLevel?: string;
  }): Promise<{ data: AiPrediction[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<any>>('/api/ai/predictions', {
      params,
    });
    return response.data.data;
  },

  /**
   * Prediksi per aset
   */
  async getByAsset(assetId: number): Promise<AiPrediction[]> {
    const response = await apiClient.get<ApiResponse<AiPrediction[]>>(
      `/api/ai/predictions/asset/${assetId}`
    );
    return response.data.data;
  },
};
