import { z } from 'zod';

export const upsertNetworkSchema = z.object({
  assetId: z.number().int().positive(),
  hostname: z.string().max(100).optional().nullable(),
  ipAddress: z.string().max(45).optional().nullable(),
  subnetMask: z.string().max(45).optional().nullable(),
  gateway: z.string().max(45).optional().nullable(),
  macAddress: z.string().max(17).optional().nullable(),
  connectionStatus: z.enum(['ONLINE', 'OFFLINE', 'UNKNOWN']).optional(),
  notes: z.string().optional().nullable(),
});

export const updateNetworkSchema = upsertNetworkSchema.partial().omit({ assetId: true });

export const queryNetworkSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z.enum(['ONLINE', 'OFFLINE', 'UNKNOWN']).optional(),
  search: z.string().optional(),
});

export type UpsertNetworkInput = z.infer<typeof upsertNetworkSchema>;
export type UpdateNetworkInput = z.infer<typeof updateNetworkSchema>;
export type QueryNetworkInput = z.infer<typeof queryNetworkSchema>;
