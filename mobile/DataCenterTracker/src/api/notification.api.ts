import { apiClient } from './client';
import type { ApiResponse, Notification, PaginatedResponse } from '@/types';

export const notificationApi = {
  /**
   * List semua notifikasi user
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }): Promise<PaginatedResponse<Notification> & { unreadCount: number }> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Notification> & { unreadCount: number }>
    >('/api/notifications', { params });
    return response.data.data;
  },

  /**
   * Unread count
   */
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
      '/api/notifications/unread-count'
    );
    return response.data.data;
  },

  /**
   * Mark as read
   */
  async markAsRead(id: number): Promise<void> {
    await apiClient.put(`/api/notifications/${id}/read`);
  },

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.put('/api/notifications/read-all');
  },
};
