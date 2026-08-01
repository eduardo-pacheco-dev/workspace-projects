import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Job } from '../jobs/job.entity';
import { ServiceOrder } from '../service-orders/service-order.entity';
import { Station } from '../stations/station.entity';
import { RadioLink } from '../radio-links/radio-link.entity';
import { Project } from '../projects/project.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  jobId: number | null;

  @ManyToOne(() => Job, (job) => job.comments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'jobId' })
  job: Job | null;

  @Column({ type: 'integer', nullable: true })
  serviceOrderId: number | null;

  @ManyToOne(() => ServiceOrder, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'serviceOrderId' })
  serviceOrder: ServiceOrder | null;

  @Column({ type: 'integer', nullable: true })
  stationId: number | null;

  @ManyToOne(() => Station, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'stationId' })
  station: Station | null;

  @Column({ type: 'integer', nullable: true })
  radioLinkId: number | null;

  @ManyToOne(() => RadioLink, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'radioLinkId' })
  radioLink: RadioLink | null;

  @Column({ type: 'integer', nullable: true })
  projectId: number | null;

  @ManyToOne(() => Project, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', default: 'Anônimo' })
  author: string;

  @CreateDateColumn()
  createdAt: Date;
}
