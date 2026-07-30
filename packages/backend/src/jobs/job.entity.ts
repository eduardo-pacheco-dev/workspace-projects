import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Attachment } from '../attachments/attachment.entity';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'real' })
  budget: number;

  @Column({ type: 'text' })
  budgetType: string;

  @Column({ type: 'text' })
  skills: string;

  @Column({ type: 'text' })
  experienceLevel: string;

  @Column({ type: 'text' })
  status: string;

  @Column({ type: 'text', nullable: true })
  clientId?: string;

  @OneToMany(() => Attachment, (att) => att.job)
  attachments: Attachment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
