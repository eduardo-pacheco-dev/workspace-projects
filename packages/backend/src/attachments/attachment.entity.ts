import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Job } from '../jobs/job.entity';
import { Freelancer } from '../freelancers/freelancer.entity';

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  jobId?: number;

  @ManyToOne(() => Job, (job) => job.attachments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'jobId' })
  job?: Job;

  @Column({ type: 'integer', nullable: true })
  freelancerId?: number;

  @ManyToOne(() => Freelancer, (f) => f.attachments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'freelancerId' })
  freelancer?: Freelancer;

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
