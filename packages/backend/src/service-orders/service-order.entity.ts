import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ServiceOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  numero: string;

  @Column({ type: 'text' })
  cliente: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'text', nullable: true })
  endereco: string | null;

  @Column({ type: 'text', nullable: true })
  data: string | null;

  @Column({ type: 'real', nullable: true })
  valor: number | null;

  @Column({ type: 'text', default: 'aberta' })
  status: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
