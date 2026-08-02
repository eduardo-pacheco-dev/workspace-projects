import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('mp_dependency')
export class MsDependency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  projectId: number;

  @Column({ type: 'int' })
  taskId: number;

  @Column({ type: 'int' })
  predecessorTaskId: number;

  @Column({ type: 'text', default: 'FS' })
  type: string;

  @Column({ type: 'int', default: 0 })
  lagDays: number;

  @CreateDateColumn()
  createdAt: Date;
}
