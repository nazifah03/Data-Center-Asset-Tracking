import { prisma } from '../../config/database';
import { CreateAssetInput, UpdateAssetInput, QueryAssetInput } from './asset.schema';

export class AssetService {
  static async getAll(query: QueryAssetInput) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};

    if (query.search) {
      where.OR = [
        { assetCode: { contains: query.search, mode: 'insensitive' } },
        { assetName: { contains: query.search, mode: 'insensitive' } },
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.type) where.assetType = query.type;
    if (query.status) where.status = query.status;
    if (query.rack) {
      where.locations = {
        some: { rack: query.rack, isCurrent: true },
      };
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy]: query.order },
        include: {
          locations: { where: { isCurrent: true }, take: 1 },
          networkInfo: true,
        },
      }),
      prisma.asset.count({ where }),
    ]);

    return {
      data: assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: number) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        locations: { orderBy: { movedAt: 'desc' } },
        networkInfo: true,
        maintenanceHistory: {
          orderBy: { maintenanceDate: 'desc' },
          include: {
            technician: {
              select: { id: true, username: true, fullName: true },
            },
          },
        },
        aiPredictions: {
          where: { isActive: true },
          orderBy: { predictedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!asset) {
      throw new Error('Aset tidak ditemukan');
    }

    return asset;
  }

  static async create(data: CreateAssetInput, userId: number) {
    // Cek asset code unik
    const existing = await prisma.asset.findUnique({
      where: { assetCode: data.assetCode },
    });

    if (existing) {
      throw new Error('Asset Code sudah digunakan');
    }

    if (data.serialNumber) {
      const existingSerial = await prisma.asset.findUnique({
        where: { serialNumber: data.serialNumber },
      });
      if (existingSerial) {
        throw new Error('Serial Number sudah digunakan');
      }
    }

    // Buat aset dengan relasi
    const asset = await prisma.asset.create({
      data: {
        assetCode: data.assetCode,
        assetName: data.assetName,
        assetType: data.assetType,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : null,
        status: data.status || 'ACTIVE',
        description: data.description,
        createdBy: userId,

        // Buat lokasi kalau dikirim
        locations: data.location
          ? {
              create: {
                dataCenter: data.location.dataCenter,
                rack: data.location.rack,
                rackSlot: data.location.rackSlot,
                floor: data.location.floor,
                room: data.location.room,
                isCurrent: true,
              },
            }
          : undefined,

        // Buat network info kalau dikirim
        networkInfo: data.network
          ? {
              create: {
                hostname: data.network.hostname,
                ipAddress: data.network.ipAddress,
                subnetMask: data.network.subnetMask,
                gateway: data.network.gateway,
                macAddress: data.network.macAddress,
                connectionStatus: data.network.connectionStatus || 'UNKNOWN',
              },
            }
          : undefined,
      },
      include: {
        locations: true,
        networkInfo: true,
      },
    });

    return asset;
  }

  static async update(id: number, data: UpdateAssetInput) {
    // Cek aset ada
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Aset tidak ditemukan');
    }

    // Cek asset code unik (kalau diubah)
    if (data.assetCode && data.assetCode !== existing.assetCode) {
      const codeExists = await prisma.asset.findUnique({
        where: { assetCode: data.assetCode },
      });
      if (codeExists) throw new Error('Asset Code sudah digunakan');
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        ...(data.assetCode && { assetCode: data.assetCode }),
        ...(data.assetName && { assetName: data.assetName }),
        ...(data.assetType && { assetType: data.assetType }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.serialNumber !== undefined && { serialNumber: data.serialNumber }),
        ...(data.purchaseDate !== undefined && {
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        }),
        ...(data.warrantyEnd !== undefined && {
          warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : null,
        }),
        ...(data.status && { status: data.status }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        locations: { where: { isCurrent: true }, take: 1 },
        networkInfo: true,
      },
    });

    // Update lokasi (kalau dikirim)
    if (data.location) {
      // Set lokasi lama jadi bukan current
      await prisma.assetLocation.updateMany({
        where: { assetId: id, isCurrent: true },
        data: { isCurrent: false },
      });

      // Buat lokasi baru
      await prisma.assetLocation.create({
        data: {
          assetId: id,
          dataCenter: data.location.dataCenter,
          rack: data.location.rack,
          rackSlot: data.location.rackSlot,
          floor: data.location.floor,
          room: data.location.room,
          isCurrent: true,
        },
      });
    }

    // Update network info (kalau dikirim)
    if (data.network) {
      await prisma.networkInformation.upsert({
        where: { assetId: id },
        update: {
          ...(data.network.hostname !== undefined && { hostname: data.network.hostname }),
          ...(data.network.ipAddress !== undefined && { ipAddress: data.network.ipAddress }),
          ...(data.network.subnetMask !== undefined && { subnetMask: data.network.subnetMask }),
          ...(data.network.gateway !== undefined && { gateway: data.network.gateway }),
          ...(data.network.macAddress !== undefined && { macAddress: data.network.macAddress }),
          ...(data.network.connectionStatus && { connectionStatus: data.network.connectionStatus }),
        },
        create: {
          assetId: id,
          hostname: data.network.hostname,
          ipAddress: data.network.ipAddress,
          subnetMask: data.network.subnetMask,
          gateway: data.network.gateway,
          macAddress: data.network.macAddress,
          connectionStatus: data.network.connectionStatus || 'UNKNOWN',
        },
      });
    }

    return this.getById(id);
  }

  static async delete(id: number) {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Aset tidak ditemukan');
    }

    await prisma.asset.delete({ where: { id } });
    return { id };
  }

  static async getStatistics() {
    const [total, active, maintenance, inactive] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'ACTIVE' } }),
      prisma.asset.count({ where: { status: 'MAINTENANCE' } }),
      prisma.asset.count({ where: { status: 'INACTIVE' } }),
    ]);

    const byType = await prisma.asset.groupBy({
      by: ['assetType'],
      _count: { _all: true },
    });

    return {
      total,
      active,
      maintenance,
      inactive,
      byType: byType.map((item) => ({
        type: item.assetType,
        count: item._count._all,
      })),
    };
  }
}
