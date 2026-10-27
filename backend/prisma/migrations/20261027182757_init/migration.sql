-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PlantKind" AS ENUM ('SPECIES', 'CULTIVAR', 'HYBRID', 'VARIETY', 'SUBSPECIES', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PlantCategory" AS ENUM ('TREE', 'SHRUB', 'PERENNIAL', 'ANNUAL', 'BIENNIAL', 'BULB', 'GRASS', 'FERN', 'CLIMBER', 'GROUNDCOVER', 'SUCCULENT', 'AQUATIC', 'OTHER');

-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LightRequirement" AS ENUM ('FULL_SUN', 'PARTIAL_SUN', 'PARTIAL_SHADE', 'FULL_SHADE');

-- CreateEnum
CREATE TYPE "SoilMoisture" AS ENUM ('DRY', 'MEDIUM', 'MOIST', 'WET');

-- CreateEnum
CREATE TYPE "SoilType" AS ENUM ('SANDY', 'LOAMY', 'CLAY', 'PEATY', 'CHALKY', 'MIXED');

-- CreateEnum
CREATE TYPE "SoilPH" AS ENUM ('ACIDIC', 'SLIGHTLY_ACIDIC', 'NEUTRAL', 'SLIGHTLY_ALKALINE', 'ALKALINE');

-- CreateEnum
CREATE TYPE "BloomColor" AS ENUM ('WHITE', 'CREAM', 'YELLOW', 'ORANGE', 'RED', 'PINK', 'PURPLE', 'BLUE', 'GREEN', 'BROWN', 'MULTICOLOR');

-- CreateEnum
CREATE TYPE "ImageStorageType" AS ENUM ('CLOUDINARY', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "PlantSourceType" AS ENUM ('BOTANICAL_DATABASE', 'WEBSITE', 'BOOK', 'EXPERT', 'USER', 'AI', 'OTHER');

-- CreateEnum
CREATE TYPE "PlantSubmissionStatus" AS ENUM ('PENDING', 'SEARCHING', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "PlantFactStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'DISPUTED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" VARCHAR(100),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" UUID NOT NULL,
    "scientificName" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "kind" "PlantKind" NOT NULL DEFAULT 'UNKNOWN',
    "category" "PlantCategory" NOT NULL DEFAULT 'OTHER',
    "status" "PlantStatus" NOT NULL DEFAULT 'PENDING',
    "parentId" UUID,
    "family" VARCHAR(150),
    "genus" VARCHAR(150),
    "species" VARCHAR(150),
    "cultivar" VARCHAR(150),
    "description" TEXT,
    "origin" VARCHAR(255),
    "minHeightCm" DOUBLE PRECISION,
    "maxHeightCm" DOUBLE PRECISION,
    "minWidthCm" DOUBLE PRECISION,
    "maxWidthCm" DOUBLE PRECISION,
    "usdaZoneMin" INTEGER,
    "usdaZoneMax" INTEGER,
    "minTempC" DOUBLE PRECISION,
    "maxTempC" DOUBLE PRECISION,
    "winterProtectionRequired" BOOLEAN,
    "lightRequirements" "LightRequirement"[],
    "soilMoisture" "SoilMoisture"[],
    "soilTypes" "SoilType"[],
    "soilPH" "SoilPH"[],
    "droughtTolerant" BOOLEAN,
    "windTolerant" BOOLEAN,
    "saltTolerant" BOOLEAN,
    "bloomColors" "BloomColor"[],
    "bloomMonths" INTEGER[],
    "foliageColors" TEXT[],
    "evergreen" BOOLEAN,
    "fragrant" BOOLEAN,
    "attractsPollinators" BOOLEAN,
    "poisonous" BOOLEAN,
    "growthRate" VARCHAR(50),
    "pruningRequired" BOOLEAN,
    "pruningMonths" INTEGER[],
    "plantingMonths" INTEGER[],
    "spacingCm" DOUBLE PRECISION,
    "lifespanYears" INTEGER,
    "extraAttributes" JSONB,
    "createdById" UUID,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantName" (
    "id" UUID NOT NULL,
    "plantId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "language" VARCHAR(10) NOT NULL DEFAULT 'uk',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantImage" (
    "id" UUID NOT NULL,
    "plantId" UUID NOT NULL,
    "storageType" "ImageStorageType" NOT NULL DEFAULT 'CLOUDINARY',
    "url" TEXT NOT NULL,
    "storageKey" VARCHAR(500),
    "sourceUrl" TEXT,
    "author" VARCHAR(255),
    "license" VARCHAR(255),
    "alt" VARCHAR(255),
    "width" INTEGER,
    "height" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantSource" (
    "id" UUID NOT NULL,
    "plantId" UUID NOT NULL,
    "type" "PlantSourceType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "url" TEXT,
    "accessedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantFact" (
    "id" UUID NOT NULL,
    "plantId" UUID NOT NULL,
    "propertyKey" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "status" "PlantFactStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "sourceUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlant" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "plantId" UUID NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flowerbed" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "widthCm" DOUBLE PRECISION,
    "lengthCm" DOUBLE PRECISION,
    "areaM2" DOUBLE PRECISION,
    "lightRequirements" "LightRequirement"[],
    "soilTypes" "SoilType"[],
    "soilPH" "SoilPH"[],
    "soilMoisture" "SoilMoisture"[],
    "location" VARCHAR(255),
    "climateZone" INTEGER,
    "notes" TEXT,
    "layout" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flowerbed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowerbedPlant" (
    "id" UUID NOT NULL,
    "flowerbedId" UUID NOT NULL,
    "plantId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "xCm" DOUBLE PRECISION,
    "yCm" DOUBLE PRECISION,
    "rotationDeg" DOUBLE PRECISION,
    "notes" TEXT,
    "plantedAt" TIMESTAMP(3),
    "customHeightCm" DOUBLE PRECISION,
    "customWidthCm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlowerbedPlant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantSubmission" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "query" VARCHAR(255) NOT NULL,
    "language" VARCHAR(10) NOT NULL DEFAULT 'uk',
    "status" "PlantSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "matchedPlantId" UUID,
    "proposedData" JSONB,
    "searchResults" JSONB,
    "aiModel" VARCHAR(100),
    "confidence" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_createdAt_idx" ON "User"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Plant_scientificName_key" ON "Plant"("scientificName");

-- CreateIndex
CREATE UNIQUE INDEX "Plant_slug_key" ON "Plant"("slug");

-- CreateIndex
CREATE INDEX "Plant_category_status_idx" ON "Plant"("category", "status");

-- CreateIndex
CREATE INDEX "Plant_parentId_idx" ON "Plant"("parentId");

-- CreateIndex
CREATE INDEX "Plant_genus_species_idx" ON "Plant"("genus", "species");

-- CreateIndex
CREATE INDEX "Plant_minHeightCm_maxHeightCm_idx" ON "Plant"("minHeightCm", "maxHeightCm");

-- CreateIndex
CREATE INDEX "Plant_minWidthCm_maxWidthCm_idx" ON "Plant"("minWidthCm", "maxWidthCm");

-- CreateIndex
CREATE INDEX "Plant_usdaZoneMin_usdaZoneMax_idx" ON "Plant"("usdaZoneMin", "usdaZoneMax");

-- CreateIndex
CREATE INDEX "Plant_minTempC_idx" ON "Plant"("minTempC");

-- CreateIndex
CREATE INDEX "Plant_evergreen_fragrant_idx" ON "Plant"("evergreen", "fragrant");

-- CreateIndex
CREATE INDEX "Plant_createdAt_idx" ON "Plant"("createdAt");

-- CreateIndex
CREATE INDEX "PlantName_name_idx" ON "PlantName"("name");

-- CreateIndex
CREATE INDEX "PlantName_language_name_idx" ON "PlantName"("language", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PlantName_plantId_name_language_key" ON "PlantName"("plantId", "name", "language");

-- CreateIndex
CREATE INDEX "PlantImage_plantId_idx" ON "PlantImage"("plantId");

-- CreateIndex
CREATE INDEX "PlantImage_storageType_idx" ON "PlantImage"("storageType");

-- CreateIndex
CREATE INDEX "PlantSource_plantId_idx" ON "PlantSource"("plantId");

-- CreateIndex
CREATE INDEX "PlantFact_plantId_propertyKey_idx" ON "PlantFact"("plantId", "propertyKey");

-- CreateIndex
CREATE INDEX "PlantFact_status_idx" ON "PlantFact"("status");

-- CreateIndex
CREATE INDEX "UserPlant_userId_createdAt_idx" ON "UserPlant"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserPlant_plantId_idx" ON "UserPlant"("plantId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlant_userId_plantId_key" ON "UserPlant"("userId", "plantId");

-- CreateIndex
CREATE INDEX "Flowerbed_userId_updatedAt_idx" ON "Flowerbed"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "Flowerbed_isPublic_createdAt_idx" ON "Flowerbed"("isPublic", "createdAt");

-- CreateIndex
CREATE INDEX "FlowerbedPlant_flowerbedId_idx" ON "FlowerbedPlant"("flowerbedId");

-- CreateIndex
CREATE INDEX "FlowerbedPlant_plantId_idx" ON "FlowerbedPlant"("plantId");

-- CreateIndex
CREATE INDEX "PlantSubmission_userId_createdAt_idx" ON "PlantSubmission"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PlantSubmission_status_createdAt_idx" ON "PlantSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PlantSubmission_matchedPlantId_idx" ON "PlantSubmission"("matchedPlantId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Plant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantName" ADD CONSTRAINT "PlantName_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantImage" ADD CONSTRAINT "PlantImage_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantSource" ADD CONSTRAINT "PlantSource_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantFact" ADD CONSTRAINT "PlantFact_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlant" ADD CONSTRAINT "UserPlant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlant" ADD CONSTRAINT "UserPlant_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flowerbed" ADD CONSTRAINT "Flowerbed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowerbedPlant" ADD CONSTRAINT "FlowerbedPlant_flowerbedId_fkey" FOREIGN KEY ("flowerbedId") REFERENCES "Flowerbed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowerbedPlant" ADD CONSTRAINT "FlowerbedPlant_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantSubmission" ADD CONSTRAINT "PlantSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantSubmission" ADD CONSTRAINT "PlantSubmission_matchedPlantId_fkey" FOREIGN KEY ("matchedPlantId") REFERENCES "Plant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
