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
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  jobId: number;

  @ManyToOne(() => Job, (job) => job.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column({ type: 'text' })
  filename: string;

  @Column({ type: 'text' })
  originalName: string;

  @Column({ type: 'text' })
  mimetype: string;

  @Column({ type: 'integer' })
  size: number;

  @CreateDateColumn()
  createdAt: Date;
}
