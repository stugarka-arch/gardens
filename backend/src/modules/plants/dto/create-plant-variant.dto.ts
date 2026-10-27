import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreatePlantVariantDto {
  @IsString() @MaxLength(150) varietyName!: string;
  @IsBoolean() isNoSpecifiedVariety!: boolean;
  @IsString() @MaxLength(100) color!: string;
  @IsOptional() @IsString() @MaxLength(100) decorativePart?: string;
  @IsOptional() @IsString() @MaxLength(100) season?: string;
  @IsUrl() sourceUrl!: string;
  @IsOptional() @IsString() description?: string;
}
