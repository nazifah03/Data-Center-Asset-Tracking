import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  assetId: z.number().int().positive(),
  technicianId: z.number().int().positive().optional().nullable(),
  maintenanceType: z.enum(['ROUTINE', 'REPAIR', 'UPGRADE', 'INSPECTION', 'REPLACEMENT']),
  maintenanceDate: z.string(),
  description: z.string().optional().nullable(),
  result: z.string().optional().nullable(),
  cost: z.number().nonnegative().optional().nullable(),
  nextSchedule: z.string().optional().nullable(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial().omit({ assetId: true });

export const queryMaintenanceSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  assetId: z.string().optional(),
  technicianId: z.string().optional(),
  type: z.enum(['ROUTINE', 'REPAIR', 'UPGRADE', 'INSPECTION', 'REPLACEMENT']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['maintenanceDate', 'createdAt']).optional().default('maintenanceDate'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
export type QueryMaintenanceInput = z.infer<typeof queryMaintenanceSchema>;
