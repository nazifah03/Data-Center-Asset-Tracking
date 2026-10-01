/**
 * TypeScript Types untuk DataCenter Asset Tracker
 * Mirrors backend schema
 */

// ============================================
// ENUMS
// ============================================

export type Role = 'ADMIN' | 'TECHNICIAN';

export type AssetType =
  | 'SERVER'
  | 'SWITCH'
  | 'ROUTER'
  | 'STORAGE'
  | 'FIREWALL'
  | 'RACK'
  | 'OTHER';

export type AssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export type ConnectionStatus = 'ONLINE' | 'OFFLINE' | 'UNKNOWN';

export type MaintenanceType =
  | 'ROUTINE'
  | 'REPAIR'
  | 'UPGRADE'
  | 'INSPECTION'
  | 'REPLACEMENT';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type NotificationType =
  | 'AI_ALERT'
  | 'MAINTENANCE_REMINDER'
  | 'SYSTEM'
  | 'INFO';

// ============================================
// USER
// ============================================

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: Role;
}

// ============================================
// ASSET
// ============================================

export interface AssetLocation {
  id: number;
  assetId: number;
  dataCenter: string;
  rack?: string | null;
  rackSlot?: string | null;
  floor?: string | null;
  room?: string | null;
  isCurrent: boolean;
  movedAt: string;
  notes?: string | null;
  createdAt: string;
}

export interface NetworkInformation {
  id: number;
  assetId: number;
  hostname?: string | null;
  ipAddress?: string | null;
  subnetMask?: string | null;
  gateway?: string | null;
  macAddress?: string | null;
  connectionStatus: ConnectionStatus;
  lastChecked?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceHistory {
  id: number;
  assetId: number;
  technicianId?: number | null;
  maintenanceType: MaintenanceType;
  maintenanceDate: string;
  description?: string | null;
  result?: string | null;
  cost?: string | null;
  nextSchedule?: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: Pick<Asset, 'id' | 'assetCode' | 'assetName' | 'assetType'>;
  technician?: Pick<User, 'id' | 'username' | 'fullName'>;
}

export interface AiPrediction {
  id: number;
  assetId: number;
  riskScore: string;
  riskLevel: RiskLevel;
  confidence?: string | null;
  topFactors?: any;
  recommendation?: string | null;
  predictedFailureDays?: number | null;
  modelVersion: string;
  predictedAt: string;
  validUntil?: string | null;
  isActive: boolean;
  asset?: Pick<Asset, 'id' | 'assetCode' | 'assetName' | 'assetType' | 'status'>;
}

export interface Asset {
  id: number;
  assetCode: string;
  assetName: string;
  assetType: AssetType;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  warrantyEnd?: string | null;
  status: AssetStatus;
  description?: string | null;
  createdBy?: number | null;
  createdAt: string;
  updatedAt: string;

  // Relasi (optional, tergantung endpoint)
  locations?: AssetLocation[];
  networkInfo?: NetworkInformation | null;
  maintenanceHistory?: MaintenanceHistory[];
  aiPredictions?: AiPrediction[];
}

export interface CreateAssetRequest {
  assetCode: string;
  assetName: string;
  assetType: AssetType;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyEnd?: string;
  status?: AssetStatus;
  description?: string;
  location?: {
    dataCenter: string;
    rack?: string;
    rackSlot?: string;
    floor?: string;
    room?: string;
  };
  network?: {
    hostname?: string;
    ipAddress?: string;
    subnetMask?: string;
    gateway?: string;
    macAddress?: string;
    connectionStatus?: ConnectionStatus;
  };
}

// ============================================
// API RESPONSE
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// NOTIFICATION
// ============================================

export interface Notification {
  id: number;
  userId: number;
  assetId?: number | null;
  predictionId?: number | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  asset?: Pick<Asset, 'id' | 'assetCode' | 'assetName' | 'assetType'> | null;
  prediction?: Pick<AiPrediction, 'id' | 'riskScore' | 'riskLevel'> | null;
}

// ============================================
// DASHBOARD STATISTICS
// ============================================

export interface AssetStatistics {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
  byType: Array<{ type: AssetType; count: number }>;
}

export interface RiskSummary {
  total: number;
  byLevel: {
    high: number;
    medium: number;
    low: number;
  };
  topRisks: AiPrediction[];
}
