import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class SpendingLimit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  category: string;

  @Column({ type: 'integer' })
  month: number;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'real' })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
