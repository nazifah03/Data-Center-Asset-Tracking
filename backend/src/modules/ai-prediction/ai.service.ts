import { prisma } from '../../config/database';
import { QueryPredictionInput } from './ai.schema';
import { calculateStatisticalAdjustment } from './ai.statistical';
import { calculatePatternBoost } from './ai.pattern';
import { generateExplanation, generateShortSummary } from './ai.explanation';

interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  contribution: number;
  description: string;
  layer: 'RULE' | 'STATISTICAL' | 'PATTERN';
}

interface PredictionResult {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  topFactors: RiskFactor[];
  recommendation: string;
  explanation: string;
  shortSummary: string;
  predictedFailureDays: number | null;
  layerBreakdown: {
    layer1: { baseScore: number; factors: RiskFactor[] };
    layer2: { adjustments: any; total: number };
    layer3: { boosts: any; total: number };
    final: number;
  };
}

export class AiService {
  /**
   * Hitung Risk Score dengan Hybrid Engine
   * Layer 1: Rule-Based (base)
   * Layer 2: Statistical Adjustment
   * Layer 3: Pattern Boost
   */
  static async calculateRisk(assetId: number): Promise<PredictionResult> {
    // 1. Ambil data aset lengkap
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        maintenanceHistory: true,
        networkInfo: true,
        locations: { where: { isCurrent: true }, take: 1 },
      },
    });

    if (!asset) throw new Error('Aset tidak ditemukan');

    // 2. Ambil data global untuk statistical analysis
    const allAssets = await prisma.asset.findMany({
      select: {
        id: true,
        assetType: true,
        _count: { select: { maintenanceHistory: true } },
      },
    });

    const allMaintenanceCounts = allAssets.map((a) => a._count.maintenanceHistory);
    const allAssetsForPeer = allAssets.map((a) => ({
      id: a.id,
      assetType: a.assetType,
      maintenanceCount: a._count.maintenanceHistory,
    }));

    // ============================================
    // LAYER 1: RULE-BASED (BASE SCORE)
    // ============================================
    const factors: RiskFactor[] = [];
    const maintenance = asset.maintenanceHistory;
    const maintenanceCount = maintenance.length;

    // 1.1 Frekuensi Maintenance (Bobot 25%)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentMaintenance = maintenance.filter(
      (m) => new Date(m.maintenanceDate) >= sixMonthsAgo
    ).length;
    const freqScore = Math.min(recentMaintenance * 20, 100);

    factors.push({
      name: 'Frekuensi Maintenance',
      score: freqScore,
      weight: 0.25,
      contribution: freqScore * 0.25,
      description: `${recentMaintenance}x maintenance dalam 6 bulan terakhir`,
      layer: 'RULE',
    });

    // 1.2 Insiden Perbaikan (Bobot 20%)
    const repairCount = maintenance.filter(
      (m) => m.maintenanceType === 'REPAIR' || m.maintenanceType === 'REPLACEMENT'
    ).length;
    const incidentScore = Math.min(repairCount * 25, 100);

    factors.push({
      name: 'Insiden Perbaikan',
      score: incidentScore,
      weight: 0.2,
      contribution: incidentScore * 0.2,
      description: `${repairCount}x perbaikan (REPAIR/REPLACEMENT)`,
      layer: 'RULE',
    });

    // 1.3 Usia Aset (Bobot 15%)
    let ageScore = 30;
    let assetAgeMonths: number | null = null;
    if (asset.purchaseDate) {
      assetAgeMonths = Math.floor(
        (Date.now() - new Date(asset.purchaseDate).getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      );
      ageScore = Math.min(20 + (assetAgeMonths / 60) * 80, 100);
    }

    factors.push({
      name: 'Usia Aset',
      score: ageScore,
      weight: 0.15,
      contribution: ageScore * 0.15,
      description: assetAgeMonths
        ? `${assetAgeMonths} bulan sejak pembelian`
        : 'Tanggal pembelian tidak tersedia',
      layer: 'RULE',
    });

    // 1.4 Status Aset (Bobot 15%)
    let statusScore = 10;
    let statusDesc = 'Aset aktif dan beroperasi normal';
    if (asset.status === 'MAINTENANCE') {
      statusScore = 100;
      statusDesc = 'Sedang dalam maintenance';
    } else if (asset.status === 'INACTIVE') {
      statusScore = 80;
      statusDesc = 'Aset tidak aktif';
    }

    factors.push({
      name: 'Status Aset',
      score: statusScore,
      weight: 0.15,
      contribution: statusScore * 0.15,
      description: statusDesc,
      layer: 'RULE',
    });

    // 1.5 Network Status (Bobot 5%)
    let networkScore = 50;
    let networkDesc = 'Network info tidak tersedia';
    if (asset.networkInfo) {
      if (asset.networkInfo.connectionStatus === 'OFFLINE') {
        networkScore = 100;
        networkDesc = 'Perangkat offline';
      } else if (asset.networkInfo.connectionStatus === 'ONLINE') {
        networkScore = 10;
        networkDesc = 'Perangkat online';
      }
    }

    factors.push({
      name: 'Status Jaringan',
      score: networkScore,
      weight: 0.05,
      contribution: networkScore * 0.05,
      description: networkDesc,
      layer: 'RULE',
    });

    const baseScore = factors.reduce((sum, f) => sum + f.contribution, 0);

    // ============================================
    // LAYER 2: STATISTICAL ADJUSTMENT
    // ============================================
    const statistical = calculateStatisticalAdjustment(
      maintenanceCount,
      maintenance.map((m) => ({
        maintenanceDate: new Date(m.maintenanceDate),
        maintenanceType: m.maintenanceType,
      })),
      asset.assetType,
      asset.id,
      allMaintenanceCounts,
      allAssetsForPeer
    );

    // ============================================
    // LAYER 3: PATTERN BOOST
    // ============================================
    const pattern = calculatePatternBoost(
      asset.networkInfo,
      maintenance.map((m) => ({
        maintenanceDate: new Date(m.maintenanceDate),
        maintenanceType: m.maintenanceType,
      }))
    );

    // ============================================
    // FINAL SCORE
    // ============================================
    const rawScore = baseScore + statistical.total + pattern.total;
    const finalScore = Math.round(Math.min(Math.max(rawScore, 0), 100) * 100) / 100;

    // Risk Level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    if (finalScore >= 61) riskLevel = 'HIGH';
    else if (finalScore >= 31) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    // Confidence
    const dataPoints =
      maintenanceCount + (asset.purchaseDate ? 1 : 0) + (asset.networkInfo ? 1 : 0);
    const confidence = Math.min(50 + dataPoints * 10, 95);

    // Predicted Failure Days
    let predictedFailureDays: number | null = null;
    if (riskLevel === 'HIGH') predictedFailureDays = 15;
    else if (riskLevel === 'MEDIUM') predictedFailureDays = 45;
    else predictedFailureDays = 90;

    // Top Factors (dari rule + statistical + pattern)
    const allFactorsForTop: RiskFactor[] = [...factors];

    if (statistical.zScoreAdjustment > 0) {
      allFactorsForTop.push({
        name: 'Z-Score Anomali',
        score: statistical.zScore * 50,
        weight: 0,
        contribution: statistical.zScoreAdjustment,
        description: `${statistical.zScore} std dev dari rata-rata`,
        layer: 'STATISTICAL',
      });
    }

    if (statistical.trendAdjustment > 0) {
      allFactorsForTop.push({
        name: 'Tren Maintenance',
        score: 100,
        weight: 0,
        contribution: statistical.trendAdjustment,
        description: 'Frekuensi maintenance meningkat',
        layer: 'STATISTICAL',
      });
    }

    if (statistical.intervalAdjustment > 0) {
      allFactorsForTop.push({
        name: 'Interval Memendek',
        score: 100,
        weight: 0,
        contribution: statistical.intervalAdjustment,
        description: 'Interval maintenance memendek',
        layer: 'STATISTICAL',
      });
    }

    if (pattern.downtimeBoost > 0) {
      allFactorsForTop.push({
        name: 'Downtime',
        score: 100,
        weight: 0,
        contribution: pattern.downtimeBoost,
        description: pattern.details.isOffline
          ? 'Network offline'
          : 'Banyak downtime',
        layer: 'PATTERN',
      });
    }

    if (pattern.repairRatioBoost > 0) {
      allFactorsForTop.push({
        name: 'Repair Ratio',
        score: 100,
        weight: 0,
        contribution: pattern.repairRatioBoost,
        description: `Rasio repair ${pattern.details.repairRatio * 100}%`,
        layer: 'PATTERN',
      });
    }

    const topFactors = allFactorsForTop
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 5);

    // Explanation
    const explanationInput = {
      assetName: asset.assetName,
      assetCode: asset.assetCode,
      riskLevel,
      riskScore: finalScore,
      maintenanceCount,
      repairCount,
      routineCount: maintenanceCount - repairCount,
      assetAgeMonths,
      status: asset.status,
      networkStatus: asset.networkInfo?.connectionStatus || 'UNKNOWN',
      zScore: statistical.zScore,
      trendRatio: 0,
      avgInterval: 0,
      latestInterval: 0,
      peerAvg: 0,
      daysSinceLastMaintenance: pattern.details.daysSinceLastMaintenance,
      predictedFailureDays,
      topFactors,
    };

    const explanation = generateExplanation(explanationInput);
    const shortSummary = generateShortSummary(explanationInput);

    return {
      riskScore: finalScore,
      riskLevel,
      confidence,
      topFactors,
      recommendation: shortSummary,
      explanation,
      shortSummary,
      predictedFailureDays,
      layerBreakdown: {
        layer1: { baseScore: Math.round(baseScore * 100) / 100, factors },
        layer2: { adjustments: statistical, total: statistical.total },
        layer3: { boosts: pattern, total: pattern.total },
        final: finalScore,
      },
    };
  }

  /**
   * Simpan hasil prediksi ke database
   */
  static async savePrediction(assetId: number, result: PredictionResult) {
    await prisma.aiPrediction.updateMany({
      where: { assetId, isActive: true },
      data: { isActive: false },
    });

    const prediction = await prisma.aiPrediction.create({
      data: {
        assetId,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        confidence: result.confidence,
        topFactors: result.topFactors as any,
        recommendation: result.recommendation,
        predictedFailureDays: result.predictedFailureDays,
        isActive: true,
      },
      include: {
        asset: {
          select: { id: true, assetCode: true, assetName: true, assetType: true },
        },
      },
    });

    if (result.riskLevel === 'HIGH') {
      await this.createRiskAlert(prediction);
    }

    return prediction;
  }

  private static async createRiskAlert(prediction: any) {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    for (const user of users) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          assetId: prediction.assetId,
          predictionId: prediction.id,
          type: 'AI_ALERT',
          title: `🚨 AI Alert: ${prediction.asset.assetCode}`,
          message: `${prediction.asset.assetName} memiliki tingkat risiko tinggi sebesar ${Math.round(
            prediction.riskScore
          )}%. Berdasarkan analisis data historis, aset disarankan untuk diprioritaskan dalam preventive maintenance.`,
        },
      });
    }
  }

  static async predictAsset(assetId: number) {
    const result = await this.calculateRisk(assetId);
    const prediction = await this.savePrediction(assetId, result);
    return {
      ...prediction,
      explanation: result.explanation,
      shortSummary: result.shortSummary,
      layerBreakdown: result.layerBreakdown,
    };
  }

  static async predictAll() {
    const assets = await prisma.asset.findMany({
      where: { status: { not: 'INACTIVE' } },
      select: { id: true },
    });

    const results = [];
    for (const asset of assets) {
      try {
        const prediction = await this.predictAsset(asset.id);
        results.push({
          assetId: asset.id,
          riskScore: prediction.riskScore,
          riskLevel: prediction.riskLevel,
          success: true,
        });
      } catch (error: any) {
        results.push({ assetId: asset.id, error: error.message, success: false });
      }
    }

    return {
      total: assets.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  static async getAll(query: QueryPredictionInput) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.onlyActive === 'true') where.isActive = true;
    if (query.riskLevel) where.riskLevel = query.riskLevel;

    const [predictions, total] = await Promise.all([
      prisma.aiPrediction.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ riskScore: 'desc' }, { predictedAt: 'desc' }],
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
      prisma.aiPrediction.count({ where }),
    ]);

    return {
      data: predictions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getByAsset(assetId: number) {
    const predictions = await prisma.aiPrediction.findMany({
      where: { assetId },
      orderBy: { predictedAt: 'desc' },
      take: 5,
    });
    return predictions;
  }

  static async getRiskSummary() {
    const [total, high, medium, low] = await Promise.all([
      prisma.aiPrediction.count({ where: { isActive: true } }),
      prisma.aiPrediction.count({ where: { isActive: true, riskLevel: 'HIGH' } }),
      prisma.aiPrediction.count({ where: { isActive: true, riskLevel: 'MEDIUM' } }),
      prisma.aiPrediction.count({ where: { isActive: true, riskLevel: 'LOW' } }),
    ]);

    const topRisks = await prisma.aiPrediction.findMany({
      where: { isActive: true, riskLevel: 'HIGH' },
      orderBy: { riskScore: 'desc' },
      take: 5,
      include: {
        asset: {
          select: { id: true, assetCode: true, assetName: true, assetType: true },
        },
      },
    });

    return {
      total,
      byLevel: { high, medium, low },
      topRisks,
    };
  }

  /**
   * Explain prediksi aset (tanpa save)
   */
  static async explainAsset(assetId: number) {
    const result = await this.calculateRisk(assetId);
    return result;
  }
}
