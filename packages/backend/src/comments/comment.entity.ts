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
import { StationEntity } from '../stations/infrastructure/station.entity';
import { RadioLink } from '../radio-links/radio-link.entity';
import { ProjectEntity } from '../projects/infrastructure/project.entity';
import { ClientEntity } from '../clients/infrastructure/client.entity';
import { Company } from '../companies/company.entity';

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

  @ManyToOne(() => StationEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'stationId' })
  station: StationEntity | null;

  @Column({ type: 'integer', nullable: true })
  radioLinkId: number | null;

  @ManyToOne(() => RadioLink, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'radioLinkId' })
  radioLink: RadioLink | null;

  @Column({ type: 'integer', nullable: true })
  projectId: number | null;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: ProjectEntity | null;

  @Column({ type: 'integer', nullable: true })
  clientId: number | null;

  @ManyToOne(() => ClientEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: ClientEntity | null;

  @Column({ type: 'integer', nullable: true })
  companyId: number | null;

  @ManyToOne(() => Company, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'companyId' })
  company: Company | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', default: 'Anônimo' })
  author: string;

  @CreateDateColumn()
  createdAt: Date;
}
