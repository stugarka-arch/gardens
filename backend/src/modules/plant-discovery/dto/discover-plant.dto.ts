import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class DiscoverPlantDto {
  @IsString() @MaxLength(255) query!: string;
  @IsOptional() @IsBoolean() isNoSpecifiedVariety?: boolean;
  @IsOptional()
  @IsString()
  @MaxLength(150)
  varietyName?: string;
  @IsOptional() @IsString() @MaxLength(100) color?: string;
  @IsOptional() @IsString() @MaxLength(10) language?: string;
}
