import { z } from 'zod';

export const queryNotificationSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  isRead: z.string().optional(),
  type: z.enum(['AI_ALERT', 'MAINTENANCE_REMINDER', 'SYSTEM', 'INFO']).optional(),
});

export const createNotificationSchema = z.object({
  userId: z.number().int().positive(),
  assetId: z.number().int().positive().optional(),
  predictionId: z.number().int().positive().optional(),
  type: z.enum(['AI_ALERT', 'MAINTENANCE_REMINDER', 'SYSTEM', 'INFO']).default('INFO'),
  title: z.string().min(3).max(200),
  message: z.string().min(3),
});

export type QueryNotificationInput = z.infer<typeof queryNotificationSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
