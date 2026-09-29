import { Request, Response } from 'express';
import { AssetService } from './asset.service';
import { createAssetSchema, updateAssetSchema, queryAssetSchema } from './asset.schema';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class AssetController {
  static async getAll(req: Request, res: Response) {
    try {
      const query = queryAssetSchema.parse(req.query);
      const result = await AssetService.getAll(query);
      return successResponse(res, result, 'Daftar aset berhasil diambil');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return errorResponse(res, 'Validasi query gagal', 400, error.errors);
      }
      return errorResponse(res, error.message, 500);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return errorResponse(res, 'ID tidak valid', 400);

      const asset = await AssetService.getById(id);
      return successResponse(res, asset, 'Detail aset berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const validated = createAssetSchema.parse(req.body);
      const asset = await AssetService.create(validated, req.user!.userId);
      return successResponse(res, asset, 'Aset berhasil ditambahkan', 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return errorResponse(res, 'Validasi gagal', 400, error.errors);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return errorResponse(res, 'ID tidak valid', 400);

      const validated = updateAssetSchema.parse(req.body);
      const asset = await AssetService.update(id, validated);
      return successResponse(res, asset, 'Aset berhasil diupdate');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return errorResponse(res, 'Validasi gagal', 400, error.errors);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return errorResponse(res, 'ID tidak valid', 400);

      const result = await AssetService.delete(id);
      return successResponse(res, result, 'Aset berhasil dihapus');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getStatistics(_req: Request, res: Response) {
    try {
      const stats = await AssetService.getStatistics();
      return successResponse(res, stats, 'Statistik berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
}
