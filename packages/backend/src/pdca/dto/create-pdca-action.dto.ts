import { IsString, IsOptional, IsInt, IsIn, Min, Max, IsNumber } from 'class-validator';
import { PDCA_STATUS_ACAO } from '../domain/pdca-rules';

export const pdcaStatusAcao = PDCA_STATUS_ACAO;

export class CreatePdcaActionDto {
  @IsString()
  what: string;

  @IsOptional()
  @IsString()
  why?: string;

  @IsOptional()
  @IsString()
  ondeAplicacao?: string;

  @IsOptional()
  @IsString()
  whenInicio?: string;

  @IsOptional()
  @IsString()
  whenPrazo?: string;

  @IsOptional()
  @IsString()
  who?: string;

  @IsOptional()
  @IsString()
  how?: string;

  @IsOptional()
  @IsNumber()
  howMuch?: number;

  @IsOptional()
  @IsIn(pdcaStatusAcao)
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progresso?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  dataInicioReal?: string;

  @IsOptional()
  @IsString()
  dataConclusaoReal?: string;
}
