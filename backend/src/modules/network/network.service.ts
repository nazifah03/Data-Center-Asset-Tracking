import { prisma } from '../../config/database';
import {
  UpsertNetworkInput,
  UpdateNetworkInput,
  QueryNetworkInput,
} from './network.schema';

export class NetworkService {
  static async getAll(query: QueryNetworkInput) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) where.connectionStatus = query.status;

    if (query.search) {
      where.OR = [
        { hostname: { contains: query.search, mode: 'insensitive' } },
        { ipAddress: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [networks, total] = await Promise.all([
      prisma.networkInformation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: {
            select: {
              id: true,
              assetCode: true,
              assetName: true,
              assetType: true,
              status: true,
            },
          },
        },
      }),
      prisma.networkInformation.count({ where }),
    ]);

    return {
      data: networks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getByAsset(assetId: number) {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new Error('Aset tidak ditemukan');

    const network = await prisma.networkInformation.findUnique({
      where: { assetId },
    });

    return network;
  }

  static async getById(id: number) {
    const network = await prisma.networkInformation.findUnique({
      where: { id },
      include: {
        asset: {
          select: { id: true, assetCode: true, assetName: true, assetType: true },
        },
      },
    });

    if (!network) throw new Error('Network info tidak ditemukan');
    return network;
  }

  static async upsert(data: UpsertNetworkInput) {
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) throw new Error('Aset tidak ditemukan');

    const network = await prisma.networkInformation.upsert({
      where: { assetId: data.assetId },
      update: {
        hostname: data.hostname,
        ipAddress: data.ipAddress,
        subnetMask: data.subnetMask,
        gateway: data.gateway,
        macAddress: data.macAddress,
        connectionStatus: data.connectionStatus || 'UNKNOWN',
        notes: data.notes,
        lastChecked: new Date(),
      },
      create: {
        assetId: data.assetId,
        hostname: data.hostname,
        ipAddress: data.ipAddress,
        subnetMask: data.subnetMask,
        gateway: data.gateway,
        macAddress: data.macAddress,
        connectionStatus: data.connectionStatus || 'UNKNOWN',
        notes: data.notes,
        lastChecked: new Date(),
      },
      include: {
        asset: {
          select: { id: true, assetCode: true, assetName: true },
        },
      },
    });

    return network;
  }

  static async update(id: number, data: UpdateNetworkInput) {
    const existing = await prisma.networkInformation.findUnique({ where: { id } });
    if (!existing) throw new Error('Network info tidak ditemukan');

    const updated = await prisma.networkInformation.update({
      where: { id },
      data: {
        ...(data.hostname !== undefined && { hostname: data.hostname }),
        ...(data.ipAddress !== undefined && { ipAddress: data.ipAddress }),
        ...(data.subnetMask !== undefined && { subnetMask: data.subnetMask }),
        ...(data.gateway !== undefined && { gateway: data.gateway }),
        ...(data.macAddress !== undefined && { macAddress: data.macAddress }),
        ...(data.connectionStatus && { connectionStatus: data.connectionStatus }),
        ...(data.notes !== undefined && { notes: data.notes }),
        lastChecked: new Date(),
      },
    });

    return updated;
  }

  static async delete(id: number) {
    const existing = await prisma.networkInformation.findUnique({ where: { id } });
    if (!existing) throw new Error('Network info tidak ditemukan');

    await prisma.networkInformation.delete({ where: { id } });
    return { id };
  }

  static async checkStatus(id: number) {
    const network = await prisma.networkInformation.findUnique({ where: { id } });
    if (!network) throw new Error('Network info tidak ditemukan');
    if (!network.ipAddress) throw new Error('IP address tidak tersedia');

    // Simulasi cek status (di produksi bisa pakai library ping)
    const newStatus = Math.random() > 0.3 ? 'ONLINE' : 'OFFLINE';

    const updated = await prisma.networkInformation.update({
      where: { id },
      data: {
        connectionStatus: newStatus,
        lastChecked: new Date(),
      },
    });

    return {
      status: updated.connectionStatus,
      lastChecked: updated.lastChecked,
      ipAddress: updated.ipAddress,
    };
  }

  static async getStatistics() {
    const [total, online, offline, unknown] = await Promise.all([
      prisma.networkInformation.count(),
      prisma.networkInformation.count({ where: { connectionStatus: 'ONLINE' } }),
      prisma.networkInformation.count({ where: { connectionStatus: 'OFFLINE' } }),
      prisma.networkInformation.count({ where: { connectionStatus: 'UNKNOWN' } }),
    ]);

    return { total, online, offline, unknown };
  }
}
