import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PdcaEntity } from './pdca.entity';

@Entity('pdca_action')
export class PdcaActionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  pdcaId: number;

  @ManyToOne(() => PdcaEntity, (pdca) => pdca.actions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pdcaId' })
  pdca: PdcaEntity;

  @Column({ type: 'text' })
  what: string;

  @Column({ type: 'text', nullable: true })
  why?: string;

  @Column({ type: 'text', nullable: true })
  ondeAplicacao?: string;

  @Column({ type: 'text', nullable: true })
  whenInicio?: string;

  @Column({ type: 'text', nullable: true })
  whenPrazo?: string;

  @Column({ type: 'text', nullable: true })
  who?: string;

  @Column({ type: 'text', nullable: true })
  how?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  howMuch?: number;

  @Column({ type: 'text', default: 'pendente' })
  status: string;

  @Column({ type: 'integer', default: 0 })
  progresso: number;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ type: 'text', nullable: true })
  dataInicioReal?: string;

  @Column({ type: 'text', nullable: true })
  dataConclusaoReal?: string | null;

  atrasado?: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
