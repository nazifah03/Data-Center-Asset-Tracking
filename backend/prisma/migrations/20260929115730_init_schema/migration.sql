-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('SERVER', 'SWITCH', 'ROUTER', 'STORAGE', 'FIREWALL', 'RACK', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('ONLINE', 'OFFLINE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('ROUTINE', 'REPAIR', 'UPGRADE', 'INSPECTION', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('AI_ALERT', 'MAINTENANCE_REMINDER', 'SYSTEM', 'INFO');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TECHNICIAN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "asset_code" VARCHAR(50) NOT NULL,
    "asset_name" VARCHAR(100) NOT NULL,
    "asset_type" "AssetType" NOT NULL,
    "brand" VARCHAR(50),
    "model" VARCHAR(50),
    "serial_number" VARCHAR(100),
    "purchase_date" DATE,
    "warranty_end" DATE,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_locations" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "data_center" VARCHAR(50) NOT NULL,
    "rack" VARCHAR(20),
    "rack_slot" VARCHAR(20),
    "floor" VARCHAR(20),
    "room" VARCHAR(50),
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "moved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "network_information" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "hostname" VARCHAR(100),
    "ip_address" VARCHAR(45),
    "subnet_mask" VARCHAR(45),
    "gateway" VARCHAR(45),
    "mac_address" VARCHAR(17),
    "connection_status" "ConnectionStatus" NOT NULL DEFAULT 'UNKNOWN',
    "last_checked" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "network_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_history" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "technician_id" INTEGER,
    "maintenance_type" "MaintenanceType" NOT NULL,
    "maintenance_date" DATE NOT NULL,
    "description" TEXT,
    "result" TEXT,
    "cost" DECIMAL(10,2),
    "next_schedule" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_predictions" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "risk_score" DECIMAL(5,2) NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "confidence" DECIMAL(5,2),
    "top_factors" JSONB,
    "recommendation" TEXT,
    "predicted_failure_days" INTEGER,
    "model_version" TEXT NOT NULL DEFAULT 'v1.0',
    "predicted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ai_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "asset_id" INTEGER,
    "prediction_id" INTEGER,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "assets_asset_code_key" ON "assets"("asset_code");

-- CreateIndex
CREATE UNIQUE INDEX "assets_serial_number_key" ON "assets"("serial_number");

-- CreateIndex
CREATE INDEX "assets_status_idx" ON "assets"("status");

-- CreateIndex
CREATE INDEX "assets_asset_type_idx" ON "assets"("asset_type");

-- CreateIndex
CREATE INDEX "assets_asset_code_idx" ON "assets"("asset_code");

-- CreateIndex
CREATE INDEX "asset_locations_asset_id_is_current_idx" ON "asset_locations"("asset_id", "is_current");

-- CreateIndex
CREATE UNIQUE INDEX "network_information_asset_id_key" ON "network_information"("asset_id");

-- CreateIndex
CREATE INDEX "network_information_ip_address_idx" ON "network_information"("ip_address");

-- CreateIndex
CREATE INDEX "maintenance_history_asset_id_idx" ON "maintenance_history"("asset_id");

-- CreateIndex
CREATE INDEX "maintenance_history_maintenance_date_idx" ON "maintenance_history"("maintenance_date");

-- CreateIndex
CREATE INDEX "ai_predictions_asset_id_is_active_idx" ON "ai_predictions"("asset_id", "is_active");

-- CreateIndex
CREATE INDEX "ai_predictions_risk_level_idx" ON "ai_predictions"("risk_level");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_locations" ADD CONSTRAINT "asset_locations_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "network_information" ADD CONSTRAINT "network_information_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_history" ADD CONSTRAINT "maintenance_history_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_history" ADD CONSTRAINT "maintenance_history_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_predictions" ADD CONSTRAINT "ai_predictions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_prediction_id_fkey" FOREIGN KEY ("prediction_id") REFERENCES "ai_predictions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
