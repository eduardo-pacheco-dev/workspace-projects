import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationEntity } from '../stations/infrastructure/station.entity';
import { RadioLinkEntity } from '../radio-links/infrastructure/radio-link.entity';
import { Company } from '../companies/company.entity';
import { PROJECT_REPOSITORY } from './domain/project.repository';
import { ProjectEntity } from './infrastructure/project.entity';
import { ProjectDocumentEntity } from './infrastructure/project-document.entity';
import { TypeOrmProjectRepository } from './infrastructure/typeorm-project.repository';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEntity, ProjectDocumentEntity, StationEntity, RadioLinkEntity, Company]),
  ],
  providers: [
    ProjectsService,
    { provide: PROJECT_REPOSITORY, useClass: TypeOrmProjectRepository },
  ],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
