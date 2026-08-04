import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ nullable: true, type: 'text' })
  lastName: string | null;

  @Column({ nullable: true, type: 'text' })
  phone: string | null;

  @Column({ type: 'text', default: 'inactive' })
  status: string;

  @Column({ unique: true, type: 'text' })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ nullable: true, type: 'text' })
  resetToken: string | null;

  @Column({ type: 'text', default: 'user' })
  role: string;

  @Column({ type: 'integer', nullable: true })
  companyId: number | null;

  @ManyToOne(() => Company, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'companyId' })
  company: Company | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
