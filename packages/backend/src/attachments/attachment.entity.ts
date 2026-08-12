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
import { Task } from '../tasks/task.entity';

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

  @Column({ type: 'integer', nullable: true })
  taskId: number | null;

  @ManyToOne(() => Task, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'taskId' })
  task: Task | null;

  @Column({ type: 'integer', nullable: true })
  folderId: number | null;

  @ManyToOne(() => Attachment, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'folderId' })
  folder: Attachment | null;

  @Column({ type: 'boolean', default: false })
  isFolder: boolean;

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
