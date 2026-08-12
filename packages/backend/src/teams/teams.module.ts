import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { CollaboratorEntity } from '../collaborators/infrastructure/collaborator.entity';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember, CollaboratorEntity])],
  providers: [TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
