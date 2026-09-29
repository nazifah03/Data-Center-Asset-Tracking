import { Request, Response } from 'express';
import { MaintenanceService } from './maintenance.service';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  queryMaintenanceSchema,
} from './maintenance.schema';
import { successResponse, errorResponse } from '../../utils/response';

export class MaintenanceController {
  static async getAll(req: Request, res: Response) {
    try {
      const query = queryMaintenanceSchema.parse(req.query);
      const result = await MaintenanceService.getAll(query);
      return successResponse(res, result, 'Daftar maintenance berhasil diambil');
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

      const data = await MaintenanceService.getById(id);
      return successResponse(res, data, 'Detail maintenance berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getByAsset(req: Request, res: Response) {
    try {
      const assetId = parseInt(req.params.assetId as string, 10);
      if (isNaN(assetId)) return errorResponse(res, 'Asset ID tidak valid', 400);

      const data = await MaintenanceService.getByAsset(assetId);
      return successResponse(res, data, 'Riwayat maintenance aset berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const validated = createMaintenanceSchema.parse(req.body);
      const data = await MaintenanceService.create(validated);
      return successResponse(res, data, 'Maintenance berhasil ditambahkan', 201);
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

      const validated = updateMaintenanceSchema.parse(req.body);
      const data = await MaintenanceService.update(id, validated);
      return successResponse(res, data, 'Maintenance berhasil diupdate');
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

      const result = await MaintenanceService.delete(id);
      return successResponse(res, result, 'Maintenance berhasil dihapus');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getStatistics(_req: Request, res: Response) {
    try {
      const stats = await MaintenanceService.getStatistics();
      return successResponse(res, stats, 'Statistik maintenance berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
}
