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
import { Project } from '../projects/project.entity';
import { PdcaAction } from './pdca-action.entity';

@Entity('pdca')
export class Pdca {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  projectId: number | null;

  @ManyToOne(() => Project, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project | null;

  @Column({ type: 'text' })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  problema?: string;

  @Column({ type: 'text', nullable: true })
  impacto?: string;

  @Column({ type: 'text', nullable: true })
  areaSetor?: string;

  @Column({ type: 'text', nullable: true })
  responsavelCiclo?: string;

  @Column({ type: 'text', nullable: true })
  tecnicaAnalise?: string;

  @Column({ type: 'text', nullable: true })
  causaRaiz?: string;

  @Column({ type: 'text', nullable: true })
  meta?: string;

  @Column({ type: 'text', default: 'plan' })
  fase: string;

  @Column({ type: 'text', default: 'aberto' })
  statusCiclo: string;

  @Column({ type: 'text', nullable: true })
  resultadoCheck?: string;

  @Column({ type: 'text', nullable: true })
  kpi?: string;

  @Column({ type: 'text', nullable: true })
  resultadoMedicao?: string;

  @Column({ type: 'text', nullable: true })
  statusValidacao?: string;

  @Column({ type: 'text', nullable: true })
  dataVerificacao?: string;

  @Column({ type: 'text', nullable: true })
  responsavelValidacao?: string;

  @Column({ type: 'text', nullable: true })
  decisoesAct?: string;

  @Column({ type: 'text', nullable: true })
  pop?: string;

  @Column({ type: 'text', nullable: true })
  licaoAprendida?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ type: 'text', nullable: true })
  dataConclusao?: string;

  @Column({ type: 'integer', nullable: true })
  cicloPaiId?: number;

  @ManyToOne(() => Pdca, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cicloPaiId' })
  cicloPai?: Pdca;

  @OneToMany(() => PdcaAction, (action) => action.pdca)
  actions: PdcaAction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
