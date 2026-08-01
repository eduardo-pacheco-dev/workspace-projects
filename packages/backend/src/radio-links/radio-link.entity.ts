import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Station } from '../stations/station.entity';

@Entity()
export class RadioLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text', nullable: true })
  frequencia?: string;

  @Column({ type: 'text', nullable: true })
  capacidade?: string;

  @Column({ type: 'integer', nullable: true })
  stationAId: number | null;

  @ManyToOne(() => Station, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'stationAId' })
  stationA: Station | null;

  @Column({ type: 'text', nullable: true })
  siteIdA?: string;

  @Column({ type: 'text', nullable: true })
  endIdA?: string;

  @Column({ type: 'text', nullable: true })
  enderecoA?: string;

  @Column({ type: 'real', nullable: true })
  latitudeA?: number;

  @Column({ type: 'real', nullable: true })
  longitudeA?: number;

  @Column({ type: 'text', nullable: true })
  operadoraA?: string;

  @Column({ type: 'integer', nullable: true })
  stationBId: number | null;

  @ManyToOne(() => Station, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'stationBId' })
  stationB: Station | null;

  @Column({ type: 'text', nullable: true })
  siteIdB?: string;

  @Column({ type: 'text', nullable: true })
  endIdB?: string;

  @Column({ type: 'text', nullable: true })
  enderecoB?: string;

  @Column({ type: 'real', nullable: true })
  latitudeB?: number;

  @Column({ type: 'real', nullable: true })
  longitudeB?: number;

  @Column({ type: 'text', nullable: true })
  operadoraB?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ type: 'text', default: 'ativo' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
