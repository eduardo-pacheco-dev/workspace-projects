import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('collaborator')
export class Collaborator {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  codigo: string | null;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text', nullable: true })
  cpf: string | null;

  @Column({ type: 'text', nullable: true })
  cargo: string | null;

  @Column({ type: 'text', nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  telefone: string | null;

  @Column({ type: 'text', nullable: true })
  endereco: string | null;

  @Column({ type: 'text', nullable: true })
  cidade: string | null;

  @Column({ type: 'text', nullable: true })
  uf: string | null;

  @Column({ type: 'text', nullable: true })
  dataAdmissao: string | null;

  @Column({ type: 'text', default: 'ativo' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
