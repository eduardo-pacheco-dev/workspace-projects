import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity()
export class ProjectDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  projectId: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text', nullable: true })
  tipo?: string;

  @Column({ type: 'integer', default: 1 })
  quantidade: number;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
