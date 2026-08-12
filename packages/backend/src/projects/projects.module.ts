import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectDocument } from './project-document.entity';
import { StationEntity } from '../stations/infrastructure/station.entity';
import { RadioLink } from '../radio-links/radio-link.entity';
import { Company } from '../companies/company.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectDocument, StationEntity, RadioLink, Company]),
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
