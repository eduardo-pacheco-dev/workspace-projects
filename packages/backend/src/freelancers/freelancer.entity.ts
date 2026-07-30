import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Freelancer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'text' })
  title: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
