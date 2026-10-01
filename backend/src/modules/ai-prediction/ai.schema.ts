import { z } from 'zod';

export const predictSingleSchema = z.object({
  assetId: z.number().int().positive(),
});

export const queryPredictionSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  onlyActive: z.string().optional().default('true'),
});

export type PredictSingleInput = z.infer<typeof predictSingleSchema>;
export type QueryPredictionInput = z.infer<typeof queryPredictionSchema>;
