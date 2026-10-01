/**
 * Pattern Matching Layer
 * Deteksi pola tersembunyi dalam data historis
 */

export interface MaintenanceRecord {
  maintenanceDate: Date;
  maintenanceType: string;
}

export interface NetworkInfo {
  connectionStatus: string;
}

export interface PatternBoost {
  downtimeBoost: number;
  repairRatioBoost: number;
  daysSinceBoost: number;
  total: number;
  details: {
    isOffline: boolean;
    repairCount: number;
    routineCount: number;
    repairRatio: number;
    daysSinceLastMaintenance: number;
  };
}

/**
 * B1: Downtime Boost
 * Network OFFLINE + banyak REPAIR = downtime tinggi
 */
const calculateDowntimeBoost = (
  network: NetworkInfo | null,
  maintenance: MaintenanceRecord[]
): number => {
  let boost = 0;

  if (network?.connectionStatus === 'OFFLINE') {
    boost += 2.5;
  }

  const repairCount = maintenance.filter(
    (m) => m.maintenanceType === 'REPAIR' || m.maintenanceType === 'REPLACEMENT'
  ).length;

  if (repairCount >= 5) boost += 2.5;
  else if (repairCount >= 3) boost += 1.5;
  else if (repairCount >= 1) boost += 0.5;

  return Math.min(boost, 5);
};

/**
 * B2: Repair Ratio Boost
 * Ratio REPAIR terhadap total maintenance
 */
const calculateRepairRatioBoost = (
  maintenance: MaintenanceRecord[]
): { boost: number; ratio: number } => {
  if (maintenance.length === 0) return { boost: 0, ratio: 0 };

  const repairCount = maintenance.filter(
    (m) => m.maintenanceType === 'REPAIR' || m.maintenanceType === 'REPLACEMENT'
  ).length;

  const ratio = repairCount / maintenance.length;

  let boost = 0;
  if (ratio > 0.7) boost = 5;
  else if (ratio > 0.5) boost = 3;
  else if (ratio > 0.3) boost = 1.5;
  else if (ratio > 0.1) boost = 0.5;

  return { boost, ratio: Math.round(ratio * 100) / 100 };
};

/**
 * B3: Days Since Last Maintenance Boost
 * Semakin lama tidak maintenance, semakin tinggi risiko
 */
const calculateDaysSinceBoost = (
  maintenance: MaintenanceRecord[]
): { boost: number; daysSince: number } => {
  if (maintenance.length === 0) {
    return { boost: 3, daysSince: -1 }; // Belum pernah maintenance
  }

  const sorted = [...maintenance].sort(
    (a, b) =>
      new Date(b.maintenanceDate).getTime() - new Date(a.maintenanceDate).getTime()
  );

  const lastMaintenance = new Date(sorted[0].maintenanceDate);
  const daysSince = Math.floor(
    (Date.now() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)
  );

  let boost = 0;
  if (daysSince > 90) boost = 5;
  else if (daysSince > 60) boost = 3;
  else if (daysSince > 30) boost = 1;

  return { boost, daysSince };
};

/**
 * Hitung semua pattern boost
 */
export const calculatePatternBoost = (
  network: NetworkInfo | null,
  maintenance: MaintenanceRecord[]
): PatternBoost => {
  const downtimeBoost = calculateDowntimeBoost(network, maintenance);
  const repairRatio = calculateRepairRatioBoost(maintenance);
  const daysSince = calculateDaysSinceBoost(maintenance);

  const total =
    downtimeBoost + repairRatio.boost + daysSince.boost;

  const repairCount = maintenance.filter(
    (m) => m.maintenanceType === 'REPAIR' || m.maintenanceType === 'REPLACEMENT'
  ).length;

  const routineCount = maintenance.filter(
    (m) => m.maintenanceType === 'ROUTINE' || m.maintenanceType === 'INSPECTION'
  ).length;

  return {
    downtimeBoost: Math.round(downtimeBoost * 100) / 100,
    repairRatioBoost: Math.round(repairRatio.boost * 100) / 100,
    daysSinceBoost: Math.round(daysSince.boost * 100) / 100,
    total: Math.round(total * 100) / 100,
    details: {
      isOffline: network?.connectionStatus === 'OFFLINE',
      repairCount,
      routineCount,
      repairRatio: repairRatio.ratio,
      daysSinceLastMaintenance: daysSince.daysSince,
    },
  };
};
