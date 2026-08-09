import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';

@Entity('client_responsavel')
export class Responsavel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  clientId: number;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text' })
  sobrenome: string;

  @Column({ type: 'text', nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  telefone?: string;

  @Column({ type: 'text', nullable: true })
  funcao?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
