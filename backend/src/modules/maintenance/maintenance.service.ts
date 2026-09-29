import { prisma } from '../../config/database';
import {
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
  QueryMaintenanceInput,
} from './maintenance.schema';

export class MaintenanceService {
  static async getAll(query: QueryMaintenanceInput) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.assetId) where.assetId = parseInt(query.assetId, 10);
    if (query.technicianId) where.technicianId = parseInt(query.technicianId, 10);
    if (query.type) where.maintenanceType = query.type;

    if (query.startDate || query.endDate) {
      where.maintenanceDate = {};
      if (query.startDate) where.maintenanceDate.gte = new Date(query.startDate);
      if (query.endDate) where.maintenanceDate.lte = new Date(query.endDate);
    }

    const [history, total] = await Promise.all([
      prisma.maintenanceHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy]: query.order },
        include: {
          asset: {
            select: { id: true, assetCode: true, assetName: true, assetType: true },
          },
          technician: {
            select: { id: true, username: true, fullName: true },
          },
        },
      }),
      prisma.maintenanceHistory.count({ where }),
    ]);

    return {
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: number) {
    const history = await prisma.maintenanceHistory.findUnique({
      where: { id },
      include: {
        asset: {
          select: { id: true, assetCode: true, assetName: true, assetType: true },
        },
        technician: {
          select: { id: true, username: true, fullName: true },
        },
      },
    });

    if (!history) {
      throw new Error('Riwayat maintenance tidak ditemukan');
    }

    return history;
  }

  static async getByAsset(assetId: number) {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      throw new Error('Aset tidak ditemukan');
    }

    const history = await prisma.maintenanceHistory.findMany({
      where: { assetId },
      orderBy: { maintenanceDate: 'desc' },
      include: {
        technician: {
          select: { id: true, username: true, fullName: true },
        },
      },
    });

    return history;
  }

  static async create(data: CreateMaintenanceInput) {
    // Cek asset ada
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) {
      throw new Error('Aset tidak ditemukan');
    }

    // Cek technician ada (kalau dikirim)
    if (data.technicianId) {
      const tech = await prisma.user.findUnique({ where: { id: data.technicianId } });
      if (!tech) throw new Error('Technician tidak ditemukan');
    }

    const history = await prisma.maintenanceHistory.create({
      data: {
        assetId: data.assetId,
        technicianId: data.technicianId,
        maintenanceType: data.maintenanceType,
        maintenanceDate: new Date(data.maintenanceDate),
        description: data.description,
        result: data.result,
        cost: data.cost,
        nextSchedule: data.nextSchedule ? new Date(data.nextSchedule) : null,
      },
      include: {
        asset: {
          select: { id: true, assetCode: true, assetName: true },
        },
        technician: {
          select: { id: true, username: true, fullName: true },
        },
      },
    });

    return history;
  }

  static async update(id: number, data: UpdateMaintenanceInput) {
    const existing = await prisma.maintenanceHistory.findUnique({ where: { id } });
    if (!existing) throw new Error('Riwayat maintenance tidak ditemukan');

    const updated = await prisma.maintenanceHistory.update({
      where: { id },
      data: {
        ...(data.maintenanceType && { maintenanceType: data.maintenanceType }),
        ...(data.maintenanceDate && { maintenanceDate: new Date(data.maintenanceDate) }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.result !== undefined && { result: data.result }),
        ...(data.cost !== undefined && { cost: data.cost }),
        ...(data.nextSchedule !== undefined && {
          nextSchedule: data.nextSchedule ? new Date(data.nextSchedule) : null,
        }),
        ...(data.technicianId !== undefined && { technicianId: data.technicianId }),
      },
    });

    return updated;
  }

  static async delete(id: number) {
    const existing = await prisma.maintenanceHistory.findUnique({ where: { id } });
    if (!existing) throw new Error('Riwayat maintenance tidak ditemukan');

    await prisma.maintenanceHistory.delete({ where: { id } });
    return { id };
  }

  static async getStatistics() {
    const total = await prisma.maintenanceHistory.count();

    const byType = await prisma.maintenanceHistory.groupBy({
      by: ['maintenanceType'],
      _count: { _all: true },
    });

    // Maintenance dalam 30 hari terakhir
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recent = await prisma.maintenanceHistory.count({
      where: { maintenanceDate: { gte: thirtyDaysAgo } },
    });

    // Total biaya
    const costAgg = await prisma.maintenanceHistory.aggregate({
      _sum: { cost: true },
    });

    return {
      total,
      recent,
      totalCost: costAgg._sum.cost || 0,
      byType: byType.map((item) => ({
        type: item.maintenanceType,
        count: item._count._all,
      })),
    };
  }
}
