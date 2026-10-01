import { prisma } from '../../config/database';
import {
  QueryNotificationInput,
  CreateNotificationInput,
} from './notification.schema';

export class NotificationService {
  static async getAll(userId: number, query: QueryNotificationInput) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.isRead !== undefined) {
      where.isRead = query.isRead === 'true';
    }

    if (query.type) where.type = query.type;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: {
            select: { id: true, assetCode: true, assetName: true, assetType: true },
          },
          prediction: {
            select: { id: true, riskScore: true, riskLevel: true },
          },
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUnreadCount(userId: number) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }

  static async getById(id: number, userId: number) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
      include: {
        asset: {
          select: { id: true, assetCode: true, assetName: true, assetType: true },
        },
        prediction: true,
      },
    });

    if (!notification) throw new Error('Notifikasi tidak ditemukan');
    return notification;
  }

  static async markAsRead(id: number, userId: number) {
    const existing = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!existing) throw new Error('Notifikasi tidak ditemukan');

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    return updated;
  }

  static async markAllAsRead(userId: number) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { updated: result.count };
  }

  static async delete(id: number, userId: number) {
    const existing = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!existing) throw new Error('Notifikasi tidak ditemukan');

    await prisma.notification.delete({ where: { id } });
    return { id };
  }

  static async deleteAllRead(userId: number) {
    const result = await prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });

    return { deleted: result.count };
  }

  static async create(data: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        assetId: data.assetId,
        predictionId: data.predictionId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
    });

    return notification;
  }
}
