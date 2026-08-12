import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';
import { STATION_MOBILE_CARRIERS } from '../domain/station.entity';

export class CreateStationDto {
  @IsString()
  siteId: string;

  @IsOptional()
  @IsString()
  endId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsIn(STATION_MOBILE_CARRIERS)
  mobileCarrier?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['ativo', 'inativo'])
  status?: string;
}
