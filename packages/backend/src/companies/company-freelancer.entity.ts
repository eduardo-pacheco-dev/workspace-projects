import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { CollaboratorEntity } from '../collaborators/infrastructure/collaborator.entity';

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

  @ManyToOne(() => CollaboratorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'freelancerId' })
  freelancer: CollaboratorEntity;

  @CreateDateColumn()
  createdAt: Date;
}
