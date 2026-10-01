import { Request, Response } from 'express';
import { NetworkService } from './network.service';
import {
  upsertNetworkSchema,
  updateNetworkSchema,
  queryNetworkSchema,
} from './network.schema';
import { successResponse, errorResponse } from '../../utils/response';

export class NetworkController {
  static async getAll(req: Request, res: Response) {
    try {
      const query = queryNetworkSchema.parse(req.query);
      const result = await NetworkService.getAll(query);
      return successResponse(res, result, 'Daftar network berhasil diambil');
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

      const data = await NetworkService.getById(id);
      return successResponse(res, data, 'Detail network berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getByAsset(req: Request, res: Response) {
    try {
      const assetId = parseInt(req.params.assetId as string, 10);
      if (isNaN(assetId)) return errorResponse(res, 'Asset ID tidak valid', 400);

      const data = await NetworkService.getByAsset(assetId);
      return successResponse(res, data, 'Network info aset berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async upsert(req: Request, res: Response) {
    try {
      const validated = upsertNetworkSchema.parse(req.body);
      const data = await NetworkService.upsert(validated);
      return successResponse(res, data, 'Network info berhasil disimpan');
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

      const validated = updateNetworkSchema.parse(req.body);
      const data = await NetworkService.update(id, validated);
      return successResponse(res, data, 'Network info berhasil diupdate');
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

      const result = await NetworkService.delete(id);
      return successResponse(res, result, 'Network info berhasil dihapus');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async checkStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return errorResponse(res, 'ID tidak valid', 400);

      const result = await NetworkService.checkStatus(id);
      return successResponse(res, result, 'Status berhasil diperiksa');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getStatistics(_req: Request, res: Response) {
    try {
      const stats = await NetworkService.getStatistics();
      return successResponse(res, stats, 'Statistik network berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
}
