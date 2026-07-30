import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Freelancer } from '../freelancers/freelancer.entity';

@Entity()
export class Lpu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  freelancerId: number;

  @ManyToOne(() => Freelancer, (freelancer) => freelancer.lpus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'freelancerId' })
  freelancer: Freelancer;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'real', nullable: true })
  valor?: number;

  @Column({ type: 'text', nullable: true })
  data?: string;

  @Column({ type: 'text', default: 'ativo' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
