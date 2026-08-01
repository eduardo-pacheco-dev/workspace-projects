import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';

export const projectDocumentTypes = [
  'Contrato',
  'Licença',
  'Laudo',
  'Relatório',
  'Projeto',
  'Foto',
  'Outro',
] as const;

export class CreateProjectDocumentDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsIn(projectDocumentTypes)
  tipo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantidade?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
