import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StationEntity } from '../../stations/infrastructure/station.entity';
import { RadioLink } from '../../radio-links/radio-link.entity';
import { Company } from '../../companies/company.entity';

@Entity('project')
export class ProjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text', nullable: true })
  codigo?: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'text', nullable: true })
  cliente?: string;

  @Column({ type: 'text', nullable: true })
  operadora?: string;

  @Column({ type: 'text', nullable: true })
  responsavel?: string;

  @Column({ type: 'text', nullable: true })
  dataInicio?: string;

  @Column({ type: 'text', nullable: true })
  dataFim?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ type: 'text', default: 'ativo' })
  status: string;

  @ManyToMany(() => StationEntity)
  @JoinTable({ name: 'project_station' })
  stations: StationEntity[];

  @ManyToMany(() => RadioLink)
  @JoinTable({ name: 'project_radio_link' })
  radioLinks: RadioLink[];

  @ManyToMany(() => Company)
  @JoinTable({ name: 'company_project' })
  companies: Company[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
