import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Team } from './team.entity';
import { CollaboratorEntity } from '../collaborators/infrastructure/collaborator.entity';

@Entity('team_member')
@Unique(['teamId', 'collaboratorId'])
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  teamId: number;

  @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column({ type: 'integer' })
  collaboratorId: number;

  @ManyToOne(() => CollaboratorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collaboratorId' })
  collaborator: CollaboratorEntity;

  @CreateDateColumn()
  createdAt: Date;
}
