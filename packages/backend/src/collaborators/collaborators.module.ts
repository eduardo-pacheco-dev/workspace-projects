import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/company.entity';
import { COLLABORATOR_REPOSITORY } from './domain/collaborator.repository';
import { CollaboratorEntity } from './infrastructure/collaborator.entity';
import { TypeOrmCollaboratorRepository } from './infrastructure/typeorm-collaborator.repository';
import { CollaboratorsService } from './collaborators.service';
import { CollaboratorsController } from './collaborators.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CollaboratorEntity, Company])],
  providers: [
    CollaboratorsService,
    { provide: COLLABORATOR_REPOSITORY, useClass: TypeOrmCollaboratorRepository },
  ],
  controllers: [CollaboratorsController],
  exports: [CollaboratorsService],
})
export class CollaboratorsModule {}
