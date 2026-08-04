import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Collaborator } from '../collaborators/collaborator.entity';

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

  @ManyToOne(() => Collaborator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'freelancerId' })
  freelancer: Collaborator;

  @CreateDateColumn()
  createdAt: Date;
}
