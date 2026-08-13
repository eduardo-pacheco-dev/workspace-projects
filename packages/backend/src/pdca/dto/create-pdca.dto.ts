import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';
import {
  PDCA_FASES,
  PDCA_STATUS_CICLO,
  PDCA_TECNICAS_ANALISE,
  PDCA_STATUS_VALIDACAO,
} from '../domain/pdca-rules';

export const pdcaFases = PDCA_FASES;
export const pdcaStatusCiclo = PDCA_STATUS_CICLO;
export const pdcaTecnicasAnalise = PDCA_TECNICAS_ANALISE;
export const pdcaStatusValidacao = PDCA_STATUS_VALIDACAO;

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
