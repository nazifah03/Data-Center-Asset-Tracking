/**
 * Explanation Generator
 * Menghasilkan narasi kaya untuk prediksi AI
 */

export interface Factor {
  name: string;
  score: number;
  weight?: number;
  contribution: number;
  description: string;
}

export interface ExplanationInput {
  assetName: string;
  assetCode: string;
  riskLevel: string;
  riskScore: number;
  maintenanceCount: number;
  repairCount: number;
  routineCount: number;
  assetAgeMonths: number | null;
  status: string;
  networkStatus: string;
  zScore: number;
  trendRatio: number;
  avgInterval: number;
  latestInterval: number;
  peerAvg: number;
  daysSinceLastMaintenance: number;
  predictedFailureDays: number | null;
  topFactors: Factor[];
}

/**
 * Generate narasi penjelasan lengkap
 */
export const generateExplanation = (input: ExplanationInput): string => {
  const parts: string[] = [];

  // 1. Summary awal
  const riskLevelText =
    input.riskLevel === 'HIGH'
      ? 'risiko tinggi'
      : input.riskLevel === 'MEDIUM'
      ? 'risiko sedang'
      : 'risiko rendah';

  parts.push(
    `Aset ${input.assetCode} (${input.assetName}) terdeteksi memiliki ${riskLevelText} dengan skor ${input.riskScore}/100.`
  );

  // 2. Data historis maintenance
  if (input.maintenanceCount > 0) {
    parts.push(
      `Terdapat ${input.maintenanceCount}x maintenance dalam 6 bulan terakhir, terdiri dari ${input.repairCount}x perbaikan dan ${input.routineCount}x rutin.`
    );
  } else {
    parts.push(`Belum ada riwayat maintenance yang tercatat.`);
  }

  // 3. Z-score analysis
  if (Math.abs(input.zScore) > 1) {
    if (input.zScore > 0) {
      parts.push(
        `Frekuensi maintenance aset ini ${input.zScore} standar deviasi di atas rata-rata (sangat tidak normal).`
      );
    } else {
      parts.push(
        `Frekuensi maintenance aset ini di bawah rata-rata (${input.zScore} std dev).`
      );
    }
  }

  // 4. Trend analysis
  if (input.trendRatio > 1.5) {
    parts.push(
      `Tren maintenance naik ${input.trendRatio}x lipat dibanding periode sebelumnya.`
    );
  } else if (input.trendRatio > 1 && input.trendRatio <= 1.5) {
    parts.push(
      `Tren maintenance sedikit meningkat (${input.trendRatio}x).`
    );
  }

  // 5. Interval analysis
  if (
    input.avgInterval > 0 &&
    input.latestInterval > 0 &&
    input.latestInterval < input.avgInterval * 0.75
  ) {
    parts.push(
      `Interval perbaikan memendek dari rata-rata ${input.avgInterval} hari menjadi ${input.latestInterval} hari terakhir.`
    );
  }

  // 6. Peer comparison
  if (input.peerAvg > 0 && input.maintenanceCount > input.peerAvg * 1.5) {
    parts.push(
      `Aset ini ${Math.round(
        (input.maintenanceCount / input.peerAvg) * 10
      ) / 10}x lebih sering diperbaiki dibanding peer dengan tipe yang sama.`
    );
  }

  // 7. Usia aset
  if (input.assetAgeMonths !== null) {
    if (input.assetAgeMonths > 60) {
      parts.push(
        `Aset sudah berusia ${input.assetAgeMonths} bulan (di atas 5 tahun, memasuki masa rawan).`
      );
    } else if (input.assetAgeMonths > 36) {
      parts.push(`Usia aset ${input.assetAgeMonths} bulan.`);
    }
  }

  // 8. Status & network
  if (input.status === 'MAINTENANCE') {
    parts.push(`Status saat ini: MAINTENANCE (masalah aktif).`);
  } else if (input.status === 'INACTIVE') {
    parts.push(`Status saat ini: INACTIVE.`);
  }

  if (input.networkStatus === 'OFFLINE') {
    parts.push(`Perangkat dalam kondisi OFFLINE.`);
  }

  // 9. Days since last maintenance
  if (input.daysSinceLastMaintenance > 60) {
    parts.push(
      `Sudah ${input.daysSinceLastMaintenance} hari sejak maintenance terakhir.`
    );
  } else if (input.daysSinceLastMaintenance === -1) {
    parts.push(`Belum pernah dilakukan maintenance.`);
  }

  // 10. Recommendation
  if (input.riskLevel === 'HIGH') {
    parts.push(
      `⚠️ Disarankan untuk segera diprioritaskan dalam preventive maintenance.`
    );
    if (input.predictedFailureDays) {
      parts.push(
        `Estimasi waktu sebelum kegagalan: ${input.predictedFailureDays} hari.`
      );
    }
  } else if (input.riskLevel === 'MEDIUM') {
    parts.push(
      `Pantau kondisi aset secara berkala dan jadwalkan maintenance rutin dalam 1 bulan ke depan.`
    );
  } else {
    parts.push(`Lakukan pengecekan rutin sesuai jadwal.`);
  }

  return parts.join(' ');
};

/**
 * Generate short summary (1-2 kalimat)
 */
export const generateShortSummary = (input: ExplanationInput): string => {
  const mainFactor = input.topFactors[0]?.name || 'data historis';

  if (input.riskLevel === 'HIGH') {
    return `${input.assetCode} risiko tinggi (${input.riskScore}/100) karena ${mainFactor.toLowerCase()}. Prioritaskan preventive maintenance.`;
  } else if (input.riskLevel === 'MEDIUM') {
    return `${input.assetCode} risiko sedang (${input.riskScore}/100). Pantau ${mainFactor.toLowerCase()}.`;
  }
  return `${input.assetCode} risiko rendah (${input.riskScore}/100). Kondisi baik.`;
};
