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
import { Collaborator } from '../collaborators/collaborator.entity';

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

  @ManyToOne(() => Collaborator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collaboratorId' })
  collaborator: Collaborator;

  @CreateDateColumn()
  createdAt: Date;
}
