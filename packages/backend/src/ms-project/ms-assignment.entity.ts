import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('mp_assignment')
export class MsAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  projectId: number;

  @Column({ type: 'int' })
  taskId: number;

  @Column({ type: 'int' })
  resourceId: number;

  @Column({ type: 'int', default: 100 })
  units: number;

  @Column({ type: 'int', nullable: true })
  work: number | null;

  @Column({ type: 'int', default: 0 })
  actualWork: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
