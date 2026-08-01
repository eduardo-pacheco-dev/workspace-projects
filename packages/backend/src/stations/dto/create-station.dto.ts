import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export const stationOperadoras = ['TIM', 'CLARO', 'VIVO', 'Outras'] as const;

export class CreateStationDto {
  @IsString()
  siteId: string;

  @IsString()
  endId: string;

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
