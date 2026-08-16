import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';

@Entity('pdca_job')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text' })
  tipo: string;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @Column({ type: 'text' })
  cronExpression: string;

  @Column({ type: 'text', default: 'ativo' })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  ultimoExecutadoEm: Date | null;

  @Column({ type: 'datetime', nullable: true })
  proximaExecucaoEm: Date | null;

  @Column({ type: 'integer', nullable: true })
  empresaId: number | null;

  @ManyToOne(() => Company, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'empresaId' })
  empresa: Company | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}