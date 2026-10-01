/**
 * Color Palette untuk DataCenter Asset Tracker
 * Extended dari template Expo dengan status colors
 */

export const BaseColors = {
  light: {
    text: '#000000',
    textSecondary: '#60646C',
    textTertiary: '#8B8D98',
    background: '#FFFFFF',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    border: '#D9D9E0',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#B0B4BA',
    textTertiary: '#7A7E85',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    border: '#2E3135',
    card: '#1A1B1E',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

/**
 * Brand & Semantic Colors (sama untuk light & dark)
 */
export const BrandColors = {
  // Primary
  primary: '#3498DB',
  primaryDark: '#2980B9',
  primaryLight: '#5DADE2',

  // Status — Asset Status
  statusActive: '#2ECC71',      // 🟢 Hijau: Normal/Aktif
  statusMaintenance: '#F39C12', // 🟠 Orange: Maintenance
  statusInactive: '#95A5A6',    // ⚪ Abu: Tidak Aktif

  // Status — Connection
  connectionOnline: '#2ECC71',  // 🟢 Online
  connectionOffline: '#E74C3C', // 🔴 Offline
  connectionUnknown: '#95A5A6', // ⚪ Unknown

  // Status — Risk Level
  riskLow: '#2ECC71',      // 🟢 Low
  riskMedium: '#F39C12',   // 🟠 Medium
  riskHigh: '#E74C3C',     // 🔴 High

  // Alerts & Feedback
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',

  // UI Elements
  divider: '#E5E5EA',
} as const;

/**
 * Mapping function untuk akses warna sesuai scheme
 */
export const getColors = (scheme: 'light' | 'dark') => ({
  ...BaseColors[scheme],
  ...BrandColors,
});

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = ReturnType<typeof getColors>;

/**
 * Helper untuk warna status aset
 */
export const getAssetStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE': return BrandColors.statusActive;
    case 'MAINTENANCE': return BrandColors.statusMaintenance;
    case 'INACTIVE': return BrandColors.statusInactive;
    default: return BrandColors.statusInactive;
  }
};

/**
 * Helper untuk warna risk level
 */
export const getRiskColor = (level: string): string => {
  switch (level) {
    case 'LOW': return BrandColors.riskLow;
    case 'MEDIUM': return BrandColors.riskMedium;
    case 'HIGH': return BrandColors.riskHigh;
    default: return BrandColors.riskLow;
  }
};

/**
 * Helper untuk warna connection status
 */
export const getConnectionColor = (status: string): string => {
  switch (status) {
    case 'ONLINE': return BrandColors.connectionOnline;
    case 'OFFLINE': return BrandColors.connectionOffline;
    default: return BrandColors.connectionUnknown;
  }
};
