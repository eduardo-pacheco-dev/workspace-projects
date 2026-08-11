import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('station')
export class StationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  siteId: string;

  @Column({ type: 'text' })
  endId: string;

  @Column({ type: 'text', nullable: true })
  endereco?: string;

  @Column({ type: 'real', nullable: true })
  latitude?: number;

  @Column({ type: 'real', nullable: true })
  longitude?: number;

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
