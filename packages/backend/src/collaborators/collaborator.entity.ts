import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { Lpu } from '../lpu/lpu.entity';

@Entity('collaborator')
export class Collaborator {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false })
  isFreelancer: boolean;

  @Column({ type: 'text', nullable: true })
  codigo: string | null;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text', nullable: true })
  cpf: string | null;

  @Column({ type: 'text', nullable: true })
  cargo: string | null;

  @Column({ type: 'text', nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  telefone: string | null;

  @Column({ type: 'text', nullable: true })
  endereco: string | null;

  @Column({ type: 'text', nullable: true })
  cidade: string | null;

  @Column({ type: 'text', nullable: true })
  uf: string | null;

  @Column({ type: 'text', nullable: true })
  dataAdmissao: string | null;

  @Column({ type: 'text', default: 'ativo' })
  status: string;

  @Column({ type: 'integer' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'integer', nullable: true })
  userId?: number;

  @Column({ type: 'text', nullable: true })
  razaoSocial?: string;

  @Column({ type: 'text', nullable: true })
  tipoContrato?: string;

  @Column({ type: 'text', nullable: true })
  regional?: string;

  @Column({ type: 'text', nullable: true })
  funcao?: string;

  @Column({ type: 'text', nullable: true })
  foto?: string;

  @Column({ type: 'text', nullable: true })
  firstName?: string;

  @Column({ type: 'text', nullable: true })
  lastName?: string;

  @Column({ type: 'text', nullable: true })
  birthDate?: string;

  @Column({ type: 'text', nullable: true })
  rg?: string;

  @Column({ type: 'text', nullable: true })
  orgaoEmissor?: string;

  @Column({ type: 'text', nullable: true })
  naturalidade?: string;

  @Column({ type: 'text', nullable: true })
  sexo?: string;

  @Column({ type: 'text', nullable: true })
  cnpj?: string;

  @Column({ type: 'text', nullable: true })
  tituloEleitor?: string;

  @Column({ type: 'text', nullable: true })
  rgArquivo?: string;

  @Column({ type: 'text', nullable: true })
  carteiraArquivo?: string;

  @Column({ type: 'text', nullable: true })
  habilitacaoArquivo?: string;

  @Column({ type: 'text', nullable: true })
  nr10Arquivo?: string;

  @Column({ type: 'text', nullable: true })
  nr35Arquivo?: string;

  @Column({ type: 'text', nullable: true })
  asoArquivo?: string;

  @Column({ type: 'text', nullable: true })
  epiArquivo?: string;

  @Column({ type: 'text', nullable: true })
  ordemServicoArquivo?: string;

  @Column({ type: 'text', nullable: true })
  contratoArquivo?: string;

  @Column({ type: 'text', nullable: true })
  cnh?: string;

  @Column({ type: 'text', nullable: true })
  cnhValidade?: string;

  @Column({ type: 'text', nullable: true })
  pis?: string;

  @Column({ type: 'text', nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  whatsapp?: string;

  @Column({ type: 'text', nullable: true })
  contatoEmergenciaNome?: string;

  @Column({ type: 'text', nullable: true })
  contatoEmergenciaTelefone?: string;

  @Column({ type: 'text', nullable: true })
  contatoEmergenciaParentesco?: string;

  @Column({ type: 'text', nullable: true })
  cep?: string;

  @Column({ type: 'text', nullable: true })
  banco?: string;

  @Column({ type: 'text', nullable: true })
  agencia?: string;

  @Column({ type: 'text', nullable: true })
  conta?: string;

  @Column({ type: 'text', nullable: true })
  tipoConta?: string;

  @Column({ type: 'text', nullable: true })
  pix?: string;

  @Column({ type: 'text', nullable: true })
  titular?: string;

  @Column({ type: 'text', nullable: true })
  trainings?: string;

  @Column({ type: 'text', nullable: true })
  dataAso?: string;

  @Column({ type: 'text', nullable: true })
  dataNr06?: string;

  @Column({ type: 'text', nullable: true })
  dataNr35?: string;

  @Column({ type: 'text', nullable: true })
  dataNr10?: string;

  @Column({ type: 'text', nullable: true })
  dataNr75?: string;

  @Column({ type: 'text', nullable: true })
  dataNr01?: string;

  @Column({ type: 'text', nullable: true })
  dataIntegracao?: string;

  @Column({ type: 'text', nullable: true })
  dataListaFerramental?: string;

  @Column({ type: 'text', nullable: true })
  cracha?: string;

  @Column({ type: 'text', nullable: true })
  dataHs?: string;

  @Column({ type: 'text', nullable: true })
  dataLtw?: string;

  @Column({ type: 'text', nullable: true })
  dataCadastroNokia?: string;

  @Column({ type: 'text', nullable: true })
  dataCadastroEricsson?: string;

  @Column({ type: 'text', nullable: true })
  dataCadastroTelebit?: string;

  @Column({ type: 'text', nullable: true })
  vencimentoAso?: string;

  @Column({ type: 'text', nullable: true })
  vencimentoNr35?: string;

  @Column({ type: 'text', nullable: true })
  vencimentoNr10?: string;

  @Column({ type: 'text', nullable: true })
  uniforms?: string;

  @Column({ type: 'text', nullable: true })
  epis?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'real', nullable: true })
  hourlyRate?: number;

  @Column({ type: 'text', nullable: true })
  skills?: string;

  @Column({ type: 'text', nullable: true })
  portfolio?: string;

  @Column({ type: 'text', nullable: true })
  experienceLevel?: string;

  @Column({ type: 'text', nullable: true })
  availability?: string;

  @OneToMany(() => Lpu, (lpu) => lpu.freelancer)
  lpus: Lpu[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
