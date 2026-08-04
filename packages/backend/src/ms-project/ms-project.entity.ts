import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('mp_project')
export class MsProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  startDate: string | null;

  @Column({ type: 'text', nullable: true })
  endDate: string | null;

  @Column({ type: 'int', nullable: true })
  durationDays: number | null;

  @Column({ type: 'text', default: 'not_started' })
  status: string;

  @Column({ type: 'text', default: '[1,2,3,4,5]' })
  workingDays: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
