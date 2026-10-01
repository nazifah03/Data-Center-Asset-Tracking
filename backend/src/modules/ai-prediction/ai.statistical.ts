/**
 * Statistical Analysis Layer
 * Menghitung adjustment berdasarkan analisis statistik
 */

export interface MaintenanceRecord {
  maintenanceDate: Date;
  maintenanceType: string;
}

export interface StatisticalAdjustment {
  zScore: number;
  zScoreAdjustment: number;
  trendAdjustment: number;
  intervalAdjustment: number;
  peerAdjustment: number;
  total: number;
}

/**
 * Helper: Hitung selisih hari antar dua tanggal
 */
const daysBetween = (date1: Date, date2: Date): number => {
  return Math.abs(
    Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24))
  );
};

/**
 * A1: Z-Score Detection
 * Deteksi aset yang berbeda signifikan dari rata-rata
 */
export const calculateZScore = (
  assetMaintenanceCount: number,
  allMaintenanceCounts: number[]
): { zScore: number; adjustment: number } => {
  if (allMaintenanceCounts.length < 3) {
    return { zScore: 0, adjustment: 0 };
  }

  const mean =
    allMaintenanceCounts.reduce((a, b) => a + b, 0) / allMaintenanceCounts.length;

  const variance =
    allMaintenanceCounts.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) /
    allMaintenanceCounts.length;

  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return { zScore: 0, adjustment: 0 };

  const zScore = (assetMaintenanceCount - mean) / stdDev;

  let adjustment = 0;
  if (zScore > 2) adjustment = 10;
  else if (zScore > 1.5) adjustment = 7;
  else if (zScore > 1) adjustment = 5;
  else if (zScore < -1) adjustment = -5;

  return { zScore: Math.round(zScore * 100) / 100, adjustment };
};

/**
 * A2: Trend Analysis
 * Deteksi apakah frekuensi maintenance meningkat
 */
export const calculateTrend = (
  maintenance: MaintenanceRecord[]
): { ratio: number; adjustment: number; recent: number; previous: number } => {
  if (maintenance.length < 2) {
    return { ratio: 0, adjustment: 0, recent: 0, previous: 0 };
  }

  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const recent = maintenance.filter(
    (m) => new Date(m.maintenanceDate) >= threeMonthsAgo
  ).length;

  const previous = maintenance.filter(
    (m) =>
      new Date(m.maintenanceDate) >= sixMonthsAgo &&
      new Date(m.maintenanceDate) < threeMonthsAgo
  ).length;

  let ratio = 0;
  let adjustment = 0;

  if (previous === 0) {
    ratio = recent;
    adjustment = recent > 0 ? 5 : 0;
  } else {
    ratio = recent / previous;
    if (ratio > 2) adjustment = 5;
    else if (ratio > 1.5) adjustment = 3;
    else if (ratio > 1) adjustment = 2;
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    adjustment,
    recent,
    previous,
  };
};

/**
 * A3: Interval Analysis
 * Deteksi interval maintenance yang memendek (worsening)
 */
export const calculateIntervalAdjustment = (
  maintenance: MaintenanceRecord[]
): {
  avgInterval: number;
  latestInterval: number;
  adjustment: number;
} => {
  if (maintenance.length < 2) {
    return { avgInterval: 0, latestInterval: 0, adjustment: 0 };
  }

  const sorted = [...maintenance].sort(
    (a, b) =>
      new Date(a.maintenanceDate).getTime() - new Date(b.maintenanceDate).getTime()
  );

  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(
      daysBetween(
        new Date(sorted[i - 1].maintenanceDate),
        new Date(sorted[i].maintenanceDate)
      )
    );
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const latestInterval = intervals[intervals.length - 1];

  let adjustment = 0;
  if (latestInterval < avgInterval * 0.5) adjustment = 5;
  else if (latestInterval < avgInterval * 0.75) adjustment = 3;
  else if (latestInterval < avgInterval * 0.9) adjustment = 1;

  return {
    avgInterval: Math.round(avgInterval),
    latestInterval: Math.round(latestInterval),
    adjustment,
  };
};

/**
 * A4: Peer Comparison
 * Bandingkan aset dengan aset sejenis
 */
export const calculatePeerAdjustment = (
  assetMaintenanceCount: number,
  assetType: string,
  allAssets: Array<{ assetType: string; maintenanceCount: number; id: number }>,
  assetId: number
): { peerAvg: number; adjustment: number } => {
  const peers = allAssets.filter(
    (a) => a.assetType === assetType && a.id !== assetId
  );

  if (peers.length === 0) {
    return { peerAvg: 0, adjustment: 0 };
  }

  const peerAvg =
    peers.reduce((sum, p) => sum + p.maintenanceCount, 0) / peers.length;

  let adjustment = 0;
  if (peerAvg === 0) {
    adjustment = assetMaintenanceCount > 0 ? 3 : 0;
  } else if (assetMaintenanceCount > peerAvg * 2) adjustment = 5;
  else if (assetMaintenanceCount > peerAvg * 1.5) adjustment = 3;
  else if (assetMaintenanceCount > peerAvg * 1.2) adjustment = 1;

  return {
    peerAvg: Math.round(peerAvg * 100) / 100,
    adjustment,
  };
};

/**
 * Hitung semua adjustment statistik
 */
export const calculateStatisticalAdjustment = (
  assetMaintenanceCount: number,
  maintenance: MaintenanceRecord[],
  assetType: string,
  assetId: number,
  allMaintenanceCounts: number[],
  allAssets: Array<{ assetType: string; maintenanceCount: number; id: number }>
): StatisticalAdjustment => {
  const zScore = calculateZScore(assetMaintenanceCount, allMaintenanceCounts);
  const trend = calculateTrend(maintenance);
  const interval = calculateIntervalAdjustment(maintenance);
  const peer = calculatePeerAdjustment(
    assetMaintenanceCount,
    assetType,
    allAssets,
    assetId
  );

  const total =
    zScore.adjustment +
    trend.adjustment +
    interval.adjustment +
    peer.adjustment;

  return {
    zScore: zScore.zScore,
    zScoreAdjustment: zScore.adjustment,
    trendAdjustment: trend.adjustment,
    intervalAdjustment: interval.adjustment,
    peerAdjustment: peer.adjustment,
    total,
  };
};
