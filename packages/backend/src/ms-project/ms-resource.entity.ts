import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('mp_resource')
export class MsResource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  projectId: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', default: 'work' })
  type: string;

  @Column({ type: 'text', nullable: true })
  email: string | null;

  @Column({ type: 'int', default: 100 })
  maxUnits: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
