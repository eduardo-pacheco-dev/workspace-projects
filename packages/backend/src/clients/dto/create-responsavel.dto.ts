import { IsString, IsOptional } from 'class-validator';

export class CreateResponsavelDto {
  @IsString()
  nome: string;

  @IsString()
  sobrenome: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  funcao?: string;
}
