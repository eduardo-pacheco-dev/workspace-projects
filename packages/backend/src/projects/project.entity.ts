import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Station } from '../stations/station.entity';
import { RadioLink } from '../radio-links/radio-link.entity';

@Entity()
export class Project {
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
  dataInicio?: string;

  @Column({ type: 'text', nullable: true })
  dataFim?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ type: 'text', default: 'ativo' })
  status: string;

  @ManyToMany(() => Station)
  @JoinTable({ name: 'project_station' })
  stations: Station[];

  @ManyToMany(() => RadioLink)
  @JoinTable({ name: 'project_radio_link' })
  radioLinks: RadioLink[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
