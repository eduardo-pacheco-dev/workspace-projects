import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Station {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text', nullable: true })
  codigo?: string;

  @Column({ type: 'text', nullable: true })
  endereco?: string;

  @Column({ type: 'real', nullable: true })
  latitude?: number;

  @Column({ type: 'real', nullable: true })
  longitude?: number;

  @Column({ type: 'text', nullable: true })
  tecnologia?: string;

  @Column({ type: 'text', nullable: true })
  operadora?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ type: 'text', default: 'ativo' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
