import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lpu } from '../lpu/lpu.entity';

@Entity()
export class Freelancer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  userId?: number;

  @Column({ type: 'text', nullable: true })
  codigo?: string;

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

  @Column({ type: 'text', default: 'ativo' })
  status: string;

  @Column({ type: 'text' })
  firstName: string;

  @Column({ type: 'text' })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  birthDate?: string;

  @Column({ type: 'text', nullable: true })
  cpf?: string;

  @Column({ type: 'text', nullable: true })
  rg?: string;

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
  endereco?: string;

  @Column({ type: 'text', nullable: true })
  cidade?: string;

  @Column({ type: 'text', nullable: true })
  uf?: string;

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
  uniforms?: string;

  @Column({ type: 'text', nullable: true })
  epis?: string;

  @Column({ type: 'text' })
  bio: string;

  @Column({ type: 'real' })
  hourlyRate: number;

  @Column({ type: 'text' })
  skills: string;

  @Column({ type: 'text' })
  portfolio: string;

  @Column({ type: 'text' })
  experienceLevel: string;

  @Column({ type: 'text' })
  availability: string;

  @OneToMany(() => Lpu, (lpu) => lpu.freelancer)
  lpus: Lpu[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
