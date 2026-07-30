import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Job } from '../jobs/job.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  jobId: number;

  @ManyToOne(() => Job, (job) => job.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', default: 'Anônimo' })
  author: string;

  @CreateDateColumn()
  createdAt: Date;
}
