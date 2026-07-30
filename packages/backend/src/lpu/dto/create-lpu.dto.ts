import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';

export class CreateLpuDto {
  @IsNumber()
  freelancerId: number;

  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @IsOptional()
  @IsString()
  data?: string;

  @IsOptional()
  @IsIn(['ativo', 'inativo'])
  status?: string;
}
