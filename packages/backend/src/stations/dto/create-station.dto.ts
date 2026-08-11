import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';
import { STATION_OPERADORAS } from '../domain/station.entity';

export const stationOperadoras = STATION_OPERADORAS;

export class CreateStationDto {
  @IsString()
  siteId: string;

  @IsOptional()
  @IsString()
  endId?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsIn(stationOperadoras)
  operadora?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsIn(['ativo', 'inativo'])
  status?: string;
}
