import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  BloomColor,
  LightRequirement,
  PlantCategory,
  SoilMoisture,
  SoilPH,
  SoilType,
} from '../../../generated/prisma/client';

const list = ({ value }: { value: unknown }) =>
  Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',').filter(Boolean)
      : undefined;

export class ListPlantsDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit = 12;
  @IsOptional() @IsEnum(PlantCategory) category?: PlantCategory;
  @IsOptional() @IsEnum(LightRequirement) light?: LightRequirement;
  @IsOptional() @IsEnum(SoilMoisture) moisture?: SoilMoisture;
  @IsOptional() @IsEnum(SoilType) soilType?: SoilType;
  @IsOptional() @IsEnum(SoilPH) ph?: SoilPH;
  @IsOptional() @IsEnum(BloomColor) bloomColor?: BloomColor;
  @IsOptional()
  @Transform(list)
  @IsEnum(LightRequirement, { each: true })
  lights?: LightRequirement[];
  @IsOptional() @Type(() => Number) @Min(0) minHeightCm?: number;
  @IsOptional() @Type(() => Number) @Min(0) maxHeightCm?: number;
  @IsOptional() @Type(() => Number) @Min(1) @Max(13) zone?: number;
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  evergreen?: boolean;
  @IsOptional() @IsString() sort?: 'name' | 'newest' | 'height';
}
