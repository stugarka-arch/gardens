-- Keeps existing Plant records intact and adds horticultural variants/colors.
CREATE TABLE "PlantVariant" (
    "id" UUID NOT NULL,
    "plantId" UUID NOT NULL,
    "varietyName" VARCHAR(150) NOT NULL,
    "normalizedVarietyName" VARCHAR(150) NOT NULL,
    "isNoSpecifiedVariety" BOOLEAN NOT NULL DEFAULT false,
    "status" "PlantStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlantVariant_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PlantVariantColor" (
    "id" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "normalizedName" VARCHAR(100) NOT NULL,
    "decorativePart" VARCHAR(100),
    "season" VARCHAR(100),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlantVariantColor_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "PlantImage" ADD COLUMN "variantId" UUID;
CREATE UNIQUE INDEX "PlantVariant_plantId_normalizedVarietyName_key" ON "PlantVariant"("plantId", "normalizedVarietyName");
CREATE INDEX "PlantVariant_plantId_status_idx" ON "PlantVariant"("plantId", "status");
CREATE INDEX "PlantVariant_normalizedVarietyName_idx" ON "PlantVariant"("normalizedVarietyName");
CREATE UNIQUE INDEX "PlantVariantColor_variantId_normalizedName_decorativePart_season_key" ON "PlantVariantColor"("variantId", "normalizedName", "decorativePart", "season");
CREATE INDEX "PlantVariantColor_variantId_isVerified_idx" ON "PlantVariantColor"("variantId", "isVerified");
CREATE INDEX "PlantImage_variantId_idx" ON "PlantImage"("variantId");
ALTER TABLE "PlantVariant" ADD CONSTRAINT "PlantVariant_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlantVariantColor" ADD CONSTRAINT "PlantVariantColor_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "PlantVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlantImage" ADD CONSTRAINT "PlantImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "PlantVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
