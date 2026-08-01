import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class CreditCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  bank: string | null;

  @Column({ type: 'text', nullable: true })
  brand: string | null;

  @Column({ type: 'real' })
  limit: number;

  @Column({ type: 'integer' })
  closingDay: number;

  @Column({ type: 'integer' })
  dueDay: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
