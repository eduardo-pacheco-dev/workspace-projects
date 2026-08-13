import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('client')
export class ClientEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text', nullable: true })
  documento?: string;

  @Column({ type: 'text', nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  telefone?: string;

  @Column({ type: 'text', nullable: true })
  endereco?: string;

  @Column({ type: 'text', nullable: true })
  cidade?: string;

  @Column({ type: 'text', nullable: true })
  uf?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ type: 'text', default: 'ativo' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
