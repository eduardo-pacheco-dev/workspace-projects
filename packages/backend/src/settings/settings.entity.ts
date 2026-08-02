import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class SystemSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'setting_key', type: 'varchar', length: 100, unique: true })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
