import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ type: 'integer' })
  clientId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
