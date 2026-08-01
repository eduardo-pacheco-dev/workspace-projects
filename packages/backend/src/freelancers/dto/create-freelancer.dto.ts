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

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  razaoSocial?: string;

  @IsOptional()
  @IsString()
  tipoContrato?: string;

  @IsOptional()
  @IsString()
  regional?: string;

  @IsOptional()
  @IsString()
  funcao?: string;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsIn(['ativo', 'inativo'])
  status?: string;

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
  orgaoEmissor?: string;

  @IsOptional()
  @IsString()
  naturalidade?: string;

  @IsOptional()
  @IsString()
  sexo?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  tituloEleitor?: string;

  @IsOptional()
  @IsString()
  rgArquivo?: string;

  @IsOptional()
  @IsString()
  carteiraArquivo?: string;

  @IsOptional()
  @IsString()
  habilitacaoArquivo?: string;

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
  contatoEmergenciaNome?: string;

  @IsOptional()
  @IsString()
  contatoEmergenciaTelefone?: string;

  @IsOptional()
  @IsString()
  contatoEmergenciaParentesco?: string;

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
  dataAso?: string;

  @IsOptional()
  @IsString()
  dataNr06?: string;

  @IsOptional()
  @IsString()
  dataNr35?: string;

  @IsOptional()
  @IsString()
  dataNr10?: string;

  @IsOptional()
  @IsString()
  dataNr75?: string;

  @IsOptional()
  @IsString()
  dataNr01?: string;

  @IsOptional()
  @IsString()
  dataIntegracao?: string;

  @IsOptional()
  @IsString()
  dataListaFerramental?: string;

  @IsOptional()
  @IsIn(['sim', 'nao'])
  cracha?: string;

  @IsOptional()
  @IsString()
  dataHs?: string;

  @IsOptional()
  @IsString()
  dataLtw?: string;

  @IsOptional()
  @IsString()
  dataCadastroNokia?: string;

  @IsOptional()
  @IsString()
  dataCadastroEricsson?: string;

  @IsOptional()
  @IsString()
  dataCadastroTelebit?: string;

  @IsOptional()
  @IsString()
  vencimentoAso?: string;

  @IsOptional()
  @IsString()
  vencimentoNr35?: string;

  @IsOptional()
  @IsString()
  vencimentoNr10?: string;

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
