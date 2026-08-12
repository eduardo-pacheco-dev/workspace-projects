import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectEntity } from './project.entity';

@Entity('project_document')
export class ProjectDocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  projectId: number;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: ProjectEntity;

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
