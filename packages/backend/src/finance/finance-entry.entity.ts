import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class FinanceEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  category: string;

  @Column({ type: 'real' })
  amount: number;

  @Column({ type: 'text' })
  date: string;

  @Column({ type: 'text', nullable: true })
  paymentMethod: string | null;

  @Column({ type: 'text', default: 'paid' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
