import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export const radioLinkOperadoras = ['TIM', 'CLARO', 'VIVO', 'Outras'] as const;

export class CreateRadioLinkDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  frequencia?: string;

  @IsOptional()
  @IsString()
  capacidade?: string;

  @IsOptional()
  @IsNumber()
  stationAId?: number;

  @IsOptional()
  @IsNumber()
  stationBId?: number;

  @IsOptional()
  @IsString()
  siteIdA?: string;

  @IsOptional()
  @IsString()
  endIdA?: string;

  @IsOptional()
  @IsString()
  enderecoA?: string;

  @IsOptional()
  @IsNumber()
  latitudeA?: number;

  @IsOptional()
  @IsNumber()
  longitudeA?: number;

  @IsOptional()
  @IsIn(radioLinkOperadoras)
  operadoraA?: string;

  @IsOptional()
  @IsString()
  siteIdB?: string;

  @IsOptional()
  @IsString()
  endIdB?: string;

  @IsOptional()
  @IsString()
  enderecoB?: string;

  @IsOptional()
  @IsNumber()
  latitudeB?: number;

  @IsOptional()
  @IsNumber()
  longitudeB?: number;

  @IsOptional()
  @IsIn(radioLinkOperadoras)
  operadoraB?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsIn(['ativo', 'inativo'])
  status?: string;
}
