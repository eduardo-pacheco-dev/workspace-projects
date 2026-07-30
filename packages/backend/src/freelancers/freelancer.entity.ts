import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lpu } from '../lpu/lpu.entity';

@Entity()
export class Freelancer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  userId?: number;

  @Column({ type: 'text' })
  firstName: string;

  @Column({ type: 'text' })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  email?: string;

  @Column({ type: 'text' })
  bio: string;

  @Column({ type: 'real' })
  hourlyRate: number;

  @Column({ type: 'text' })
  skills: string;

  @Column({ type: 'text' })
  portfolio: string;

  @Column({ type: 'text' })
  experienceLevel: string;

  @Column({ type: 'text' })
  availability: string;

  @OneToMany(() => Lpu, (lpu) => lpu.freelancer)
  lpus: Lpu[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
