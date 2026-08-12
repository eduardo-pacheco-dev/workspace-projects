import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('task')
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', default: 'pending' })
  status: string;

  @Column({ type: 'text', default: 'medium' })
  priority: string;

  @Column({ type: 'text', nullable: true })
  dueAt: string | null;

  @Column({ type: 'text', nullable: true })
  project: string | null;

  @Column({ type: 'text', nullable: true })
  client: string | null;

  @Column({ type: 'text', nullable: true })
  assignedTo: string | null;

  @Column({ type: 'integer', nullable: true })
  parentId?: number;

  @ManyToOne(() => TaskEntity, (task) => task.subtasks, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: TaskEntity;

  @OneToMany(() => TaskEntity, (task) => task.parent)
  subtasks: TaskEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
