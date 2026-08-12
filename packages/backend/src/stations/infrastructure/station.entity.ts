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
  elementType?: string;

  @Column({ type: 'text', nullable: true })
  technology?: string;

  @Column({ type: 'text', nullable: true })
  areaHolder?: string;

  @Column({ type: 'text', nullable: true })
  infraContractType?: string;

  @Column({ type: 'text', nullable: true })
  infraHolder?: string;

  @Column({ type: 'text', nullable: true })
  infraType?: string;

  @Column({ type: 'text', nullable: true })
  evType?: string;

  @Column({ type: 'text', nullable: true })
  evSupplier?: string;

  @Column({ type: 'text', nullable: true, name: 'endereco' })
  address?: string;

  @Column({ type: 'text', nullable: true })
  regional?: string;

  @Column({ type: 'real', nullable: true })
  latitude?: number;

  @Column({ type: 'real', nullable: true })
  longitude?: number;

  @Column({ type: 'text', nullable: true, name: 'operadora' })
  mobileCarrier?: string;

  @Column({ type: 'text', nullable: true })
  towerType?: string;

  @Column({ type: 'real', nullable: true })
  nominalAev?: number;

  @Column({ type: 'real', nullable: true })
  groundArea?: number;

  @Column({ type: 'real', nullable: true })
  structureHeight?: number;

  @Column({ type: 'text', nullable: true })
  stationId?: string;

  @Column({ type: 'text', nullable: true, name: 'observacoes' })
  notes?: string;

  @Column({ type: 'text', default: 'ativo' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
