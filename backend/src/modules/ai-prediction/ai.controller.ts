import { Request, Response } from 'express';
import { AiService } from './ai.service';
import { queryPredictionSchema } from './ai.schema';
import { successResponse, errorResponse } from '../../utils/response';

export class AiController {
  static async getAll(req: Request, res: Response) {
    try {
      const query = queryPredictionSchema.parse(req.query);
      const result = await AiService.getAll(query);
      return successResponse(res, result, 'Daftar prediksi berhasil diambil');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return errorResponse(res, 'Validasi query gagal', 400, error.errors);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  static async getByAsset(req: Request, res: Response) {
    try {
      const assetId = parseInt(req.params.assetId as string, 10);
      if (isNaN(assetId)) return errorResponse(res, 'Asset ID tidak valid', 400);

      const data = await AiService.getByAsset(assetId);
      return successResponse(res, data, 'Prediksi aset berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getRiskSummary(_req: Request, res: Response) {
    try {
      const summary = await AiService.getRiskSummary();
      return successResponse(res, summary, 'Ringkasan risiko berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async predictSingle(req: Request, res: Response) {
    try {
      const assetId = parseInt(req.params.assetId as string, 10);
      if (isNaN(assetId)) return errorResponse(res, 'Asset ID tidak valid', 400);

      const result = await AiService.predictAsset(assetId);
      return successResponse(res, result, 'Prediksi berhasil dihitung');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async predictBatch(_req: Request, res: Response) {
    try {
      const result = await AiService.predictAll();
      return successResponse(res, result, 'Batch prediksi selesai');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Explain prediksi aset tanpa save ke database
   * Berguna untuk melihat detail layer breakdown
   */
  static async explain(req: Request, res: Response) {
    try {
      const assetId = parseInt(req.params.assetId as string, 10);
      if (isNaN(assetId)) return errorResponse(res, 'Asset ID tidak valid', 400);

      const result = await AiService.explainAsset(assetId);
      return successResponse(res, result, 'Penjelasan prediksi berhasil dibuat');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}