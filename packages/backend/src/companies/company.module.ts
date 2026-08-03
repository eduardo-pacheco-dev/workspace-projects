import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompanyCollaborator } from './company-collaborator.entity';
import { CompanyFreelancer } from './company-freelancer.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanyCollaboratorService } from './company-collaborator.service';
import { CompanyCollaboratorController } from './company-collaborator.controller';
import { CompanyFreelancerService } from './company-freelancer.service';
import { CompanyFreelancerController } from './company-freelancer.controller';
import { CompanyProjectController } from './company-project.controller';
import { FreelancersModule } from '../freelancers/freelancers.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, CompanyCollaborator, CompanyFreelancer]),
    FreelancersModule,
    ProjectsModule,
  ],
  providers: [CompanyService, CompanyCollaboratorService, CompanyFreelancerService],
  controllers: [CompanyController, CompanyCollaboratorController, CompanyFreelancerController, CompanyProjectController],
  exports: [CompanyService, CompanyCollaboratorService, CompanyFreelancerService],
})
export class CompaniesModule {}
