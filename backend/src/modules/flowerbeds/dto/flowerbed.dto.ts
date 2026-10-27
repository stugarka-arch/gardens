import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  LightRequirement,
  SoilMoisture,
  SoilPH,
  SoilType,
} from '../../../generated/prisma/client';

export class FlowerbedDto {
  @IsString() @MaxLength(150) name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) widthCm?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) lengthCm?: number;
  @IsOptional()
  @IsArray()
  @IsEnum(LightRequirement, { each: true })
  lightRequirements?: LightRequirement[];
  @IsOptional()
  @IsArray()
  @IsEnum(SoilType, { each: true })
  soilTypes?: SoilType[];
  @IsOptional() @IsArray() @IsEnum(SoilPH, { each: true }) soilPH?: SoilPH[];
  @IsOptional()
  @IsArray()
  @IsEnum(SoilMoisture, { each: true })
  soilMoisture?: SoilMoisture[];
  @IsOptional() @IsString() @MaxLength(255) location?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Min(1)
  climateZone?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsObject() layout?: Record<string, unknown>;
  @IsOptional() @IsBoolean() isPublic?: boolean;
}

export class UpdateFlowerbedDto extends FlowerbedDto {
  @IsOptional() declare name: string;
}

export class AddFlowerbedPlantDto {
  @IsString() plantId!: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) quantity?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) xCm?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) yCm?: number;
  @IsOptional() @Type(() => Number) @IsNumber() rotationDeg?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsDateString() plantedAt?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) customHeightCm?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) customWidthCm?: number;
}

export class UpdateFlowerbedPlantDto extends AddFlowerbedPlantDto {
  @IsOptional() declare plantId: string;
}
