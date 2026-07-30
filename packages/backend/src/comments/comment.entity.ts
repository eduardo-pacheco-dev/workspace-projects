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
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  jobId?: number;

  @ManyToOne(() => Job, (job) => job.comments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'jobId' })
  job?: Job;

  @Column({ type: 'integer', nullable: true })
  freelancerId?: number;

  @ManyToOne(() => Freelancer, (f) => f.comments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'freelancerId' })
  freelancer?: Freelancer;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', default: 'Anônimo' })
  author: string;

  @CreateDateColumn()
  createdAt: Date;
}
