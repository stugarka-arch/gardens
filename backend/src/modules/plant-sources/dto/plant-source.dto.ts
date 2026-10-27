import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { PlantSourceType } from '../../../generated/prisma/client';

export class CreatePlantSourceDto {
  @IsString() @MaxLength(255) name!: string;
  @IsEnum(PlantSourceType) type!: PlantSourceType;
  @IsOptional() @IsUrl() url?: string;
  @IsOptional() @IsDateString() accessedAt?: string;
  @IsOptional() @IsString() notes?: string;
}
