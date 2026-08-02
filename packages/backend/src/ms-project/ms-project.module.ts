import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MsProject } from './ms-project.entity';
import { MsTask } from './ms-task.entity';
import { MsDependency } from './ms-dependency.entity';
import { MsResource } from './ms-resource.entity';
import { MsAssignment } from './ms-assignment.entity';
import { MsProjectService } from './ms-project.service';
import { MsProjectController } from './ms-project.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MsProject, MsTask, MsDependency, MsResource, MsAssignment]),
  ],
  providers: [MsProjectService],
  controllers: [MsProjectController],
  exports: [MsProjectService],
})
export class MsProjectModule {}
