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

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  jobId: number | null;

  @ManyToOne(() => Job, (job) => job.attachments, { onDelete: 'CASCADE', nullable: true })
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
