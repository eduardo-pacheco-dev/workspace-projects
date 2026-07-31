import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ServiceOrder } from '../service-order.entity';

@Entity()
export class ServiceOrderObservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  serviceOrderId: number;

  @ManyToOne(() => ServiceOrder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceOrderId' })
  serviceOrder: ServiceOrder;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'integer', default: 0 })
  position: number;

  @Column({ type: 'text', nullable: true })
  filename: string | null;

  @Column({ type: 'text', nullable: true })
  originalName: string | null;

  @Column({ type: 'text', nullable: true })
  mimetype: string | null;

  @Column({ type: 'integer', nullable: true })
  size: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
