import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('mp_task')
export class MsTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  projectId: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'int', default: 1 })
  durationDays: number;

  @Column({ type: 'boolean', default: false })
  milestone: boolean;

  @Column({ type: 'int', default: 0 })
  percentComplete: number;

  @Column({ type: 'text', default: 'medium' })
  priority: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  startDate: string | null;

  @Column({ type: 'text', nullable: true })
  finishDate: string | null;

  @Column({ type: 'boolean', default: false })
  critical: boolean;

  @Column({ type: 'int', default: 0 })
  position: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
