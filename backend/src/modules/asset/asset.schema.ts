import { z } from 'zod';

export const createAssetSchema = z.object({
  assetCode: z.string().min(2).max(50),
  assetName: z.string().min(2).max(100),
  assetType: z.enum(['SERVER', 'SWITCH', 'ROUTER', 'STORAGE', 'FIREWALL', 'RACK', 'OTHER']),
  brand: z.string().max(50).optional().nullable(),
  model: z.string().max(50).optional().nullable(),
  serialNumber: z.string().max(100).optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  warrantyEnd: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']).optional(),
  description: z.string().optional().nullable(),
  // Location (opsional, langsung buat lokasi)
  location: z.object({
    dataCenter: z.string().min(1).max(50),
    rack: z.string().max(20).optional().nullable(),
    rackSlot: z.string().max(20).optional().nullable(),
    floor: z.string().max(20).optional().nullable(),
    room: z.string().max(50).optional().nullable(),
  }).optional(),
  // Network (opsional, langsung buat network info)
  network: z.object({
    hostname: z.string().max(100).optional().nullable(),
    ipAddress: z.string().max(45).optional().nullable(),
    subnetMask: z.string().max(45).optional().nullable(),
    gateway: z.string().max(45).optional().nullable(),
    macAddress: z.string().max(17).optional().nullable(),
    connectionStatus: z.enum(['ONLINE', 'OFFLINE', 'UNKNOWN']).optional(),
  }).optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export const queryAssetSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  type: z.enum(['SERVER', 'SWITCH', 'ROUTER', 'STORAGE', 'FIREWALL', 'RACK', 'OTHER']).optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']).optional(),
  rack: z.string().optional(),
  sortBy: z.enum(['assetName', 'assetCode', 'createdAt', 'status']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type QueryAssetInput = z.infer<typeof queryAssetSchema>;
