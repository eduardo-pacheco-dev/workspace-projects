import { IsString, IsOptional, IsIn } from 'class-validator';
import { CLIENT_STATUSES } from '../domain/client-rules';

export class CreateClientDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  uf?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsIn(CLIENT_STATUSES)
  status?: string;
}
