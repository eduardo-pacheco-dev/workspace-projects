import { IsString, IsOptional, IsInt, IsIn, Min, Max, IsNumber } from 'class-validator';

export const pdcaStatusAcao = ['pendente', 'em_andamento', 'concluido', 'atrasado'] as const;

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
