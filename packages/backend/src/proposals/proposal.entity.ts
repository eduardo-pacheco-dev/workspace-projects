import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Proposal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  jobId: number;

  @Column({ type: 'integer' })
  freelancerId: number;

  @Column({ type: 'text' })
  coverLetter: string;

  @Column({ type: 'real' })
  proposedRate: number;

  @Column({ type: 'text' })
  estimatedDuration: string;

  @Column({ type: 'text' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
