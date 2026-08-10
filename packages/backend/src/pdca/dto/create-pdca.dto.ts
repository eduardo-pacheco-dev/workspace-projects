import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';

export const pdcaFases = ['plan', 'do', 'check', 'act'] as const;
export const pdcaStatusCiclo = ['aberto', 'em_execucao', 'em_verificacao', 'concluido', 'cancelado'] as const;
export const pdcaTecnicasAnalise = ['5-porques', 'ishikawa', 'livre'] as const;
export const pdcaStatusValidacao = ['sucesso', 'sucesso_parcial', 'falha'] as const;

export class CreatePdcaDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsString()
  problema?: string;

  @IsOptional()
  @IsString()
  impacto?: string;

  @IsOptional()
  @IsString()
  areaSetor?: string;

  @IsOptional()
  @IsString()
  responsavelCiclo?: string;

  @IsOptional()
  @IsIn(pdcaTecnicasAnalise)
  tecnicaAnalise?: string;

  @IsOptional()
  @IsString()
  causaRaiz?: string;

  @IsOptional()
  @IsString()
  meta?: string;

  @IsOptional()
  @IsIn(pdcaFases)
  fase?: string;

  @IsOptional()
  @IsIn(pdcaStatusCiclo)
  statusCiclo?: string;

  @IsOptional()
  @IsString()
  resultadoCheck?: string;

  @IsOptional()
  @IsString()
  kpi?: string;

  @IsOptional()
  @IsString()
  resultadoMedicao?: string;

  @IsOptional()
  @IsIn(pdcaStatusValidacao)
  statusValidacao?: string;

  @IsOptional()
  @IsString()
  dataVerificacao?: string;

  @IsOptional()
  @IsString()
  responsavelValidacao?: string;

  @IsOptional()
  @IsString()
  decisoesAct?: string;

  @IsOptional()
  @IsString()
  pop?: string;

  @IsOptional()
  @IsString()
  licaoAprendida?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  dataConclusao?: string;

  @IsOptional()
  @IsInt()
  cicloPaiId?: number;
}
