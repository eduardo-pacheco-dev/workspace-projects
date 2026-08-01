import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  cliente?: string;

  @IsOptional()
  @IsString()
  dataInicio?: string;

  @IsOptional()
  @IsString()
  dataFim?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsIn(['ativo', 'inativo'])
  status?: string;
}
