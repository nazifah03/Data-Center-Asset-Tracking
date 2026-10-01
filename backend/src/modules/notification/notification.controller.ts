import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { queryNotificationSchema } from './notification.schema';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class NotificationController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const query = queryNotificationSchema.parse(req.query);
      const result = await NotificationService.getAll(req.user!.userId, query);
      return successResponse(res, result, 'Daftar notifikasi berhasil diambil');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return errorResponse(res, 'Validasi query gagal', 400, error.errors);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const result = await NotificationService.getUnreadCount(req.user!.userId);
      return successResponse(res, result, 'Jumlah unread berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return errorResponse(res, 'ID tidak valid', 400);

      const data = await NotificationService.getById(id, req.user!.userId);
      return successResponse(res, data, 'Detail notifikasi berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return errorResponse(res, 'ID tidak valid', 400);

      const data = await NotificationService.markAsRead(id, req.user!.userId);
      return successResponse(res, data, 'Notifikasi ditandai sudah dibaca');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const result = await NotificationService.markAllAsRead(req.user!.userId);
      return successResponse(res, result, 'Semua notifikasi ditandai sudah dibaca');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return errorResponse(res, 'ID tidak valid', 400);

      const result = await NotificationService.delete(id, req.user!.userId);
      return successResponse(res, result, 'Notifikasi berhasil dihapus');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async deleteAllRead(req: AuthRequest, res: Response) {
    try {
      const result = await NotificationService.deleteAllRead(req.user!.userId);
      return successResponse(res, result, 'Notifikasi yang sudah dibaca berhasil dihapus');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
}
