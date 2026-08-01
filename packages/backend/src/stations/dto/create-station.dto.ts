import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateStationDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  codigo?: string;

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
  @IsString()
  tecnologia?: string;

  @IsOptional()
  @IsString()
  operadora?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsIn(['ativo', 'inativo'])
  status?: string;
}
