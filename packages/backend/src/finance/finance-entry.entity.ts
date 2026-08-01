import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BankAccount } from './bank-account.entity';
import { CreditCard } from './credit-card.entity';

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

  @Column({ type: 'integer', nullable: true })
  accountId: number | null;

  @ManyToOne(() => BankAccount, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'accountId' })
  account: BankAccount | null;

  @Column({ type: 'integer', nullable: true })
  cardId: number | null;

  @ManyToOne(() => CreditCard, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cardId' })
  card: CreditCard | null;

  @Column({ type: 'text', nullable: true })
  recurrence: string | null;

  @Column({ type: 'text', nullable: true })
  recurrenceEnd: string | null;

  @Column({ type: 'text', nullable: true })
  seriesId: string | null;

  @Column({ type: 'text', nullable: true })
  tags: string | null;

  @Column({ type: 'text', nullable: true })
  attachment: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
