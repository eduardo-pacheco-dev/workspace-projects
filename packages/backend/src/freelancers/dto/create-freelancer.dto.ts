import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
} from 'class-validator';

export class CreateFreelancerDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @IsString()
  cnh?: string;

  @IsOptional()
  @IsString()
  cnhValidade?: string;

  @IsOptional()
  @IsString()
  pis?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

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
  cep?: string;

  @IsOptional()
  @IsString()
  banco?: string;

  @IsOptional()
  @IsString()
  agencia?: string;

  @IsOptional()
  @IsString()
  conta?: string;

  @IsOptional()
  @IsString()
  tipoConta?: string;

  @IsOptional()
  @IsString()
  pix?: string;

  @IsOptional()
  @IsString()
  titular?: string;

  @IsOptional()
  @IsString()
  trainings?: string;

  @IsOptional()
  @IsString()
  uniforms?: string;

  @IsOptional()
  @IsString()
  epis?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  portfolio?: string;

  @IsOptional()
  @IsIn(['junior', 'mid', 'senior', 'lead'])
  experienceLevel?: string;

  @IsOptional()
  @IsIn(['available', 'busy', 'unavailable'])
  availability?: string;
}
