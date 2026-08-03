import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Freelancer } from '../freelancers/freelancer.entity';

@Entity('company_freelancer')
export class CompanyFreelancer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'integer' })
  freelancerId: number;

  @ManyToOne(() => Freelancer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'freelancerId' })
  freelancer: Freelancer;

  @CreateDateColumn()
  createdAt: Date;
}
