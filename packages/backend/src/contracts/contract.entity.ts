import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'integer' })
  proposalId: number | null;

  @Column({ type: 'integer' })
  jobId: number;

  @Column({ type: 'integer' })
  freelancerId: number;

  @Column({ type: 'integer' })
  clientId: number;

  @Column({ type: 'text' })
  startDate: string;

  @Column({ nullable: true, type: 'text' })
  endDate: string | null;

  @Column({ type: 'text' })
  status: string;

  @Column({ type: 'real' })
  totalBudget: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
