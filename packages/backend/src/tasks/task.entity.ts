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
export class Task {
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

  @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: Task;

  @OneToMany(() => Task, (task) => task.parent)
  subtasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
