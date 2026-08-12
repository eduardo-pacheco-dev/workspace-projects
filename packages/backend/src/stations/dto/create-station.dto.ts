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
  elementType?: string;

  @IsOptional()
  @IsString()
  technology?: string;

  @IsOptional()
  @IsString()
  areaHolder?: string;

  @IsOptional()
  @IsString()
  infraContractType?: string;

  @IsOptional()
  @IsString()
  infraHolder?: string;

  @IsOptional()
  @IsString()
  infraType?: string;

  @IsOptional()
  @IsString()
  evType?: string;

  @IsOptional()
  @IsString()
  evSupplier?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  regional?: string;

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
  towerType?: string;

  @IsOptional()
  @IsNumber()
  nominalAev?: number;

  @IsOptional()
  @IsNumber()
  groundArea?: number;

  @IsOptional()
  @IsNumber()
  structureHeight?: number;

  @IsOptional()
  @IsString()
  stationId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['ativo', 'inativo'])
  status?: string;
}
