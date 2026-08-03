import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { FreelancersModule } from '../freelancers/freelancers.module';
import { JobsModule } from '../jobs/jobs.module';
import { LpuModule } from '../lpu/lpu.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { TasksModule } from '../tasks/task.module';
import { MsProjectModule } from '../ms-project/ms-project.module';
import { SettingsModule } from '../settings/settings.module';
import { CompaniesModule } from '../companies/company.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { SeedService } from './seed.service';

@Module({
  imports: [UsersModule, FreelancersModule, JobsModule, LpuModule, ScheduleModule, TasksModule, MsProjectModule, SettingsModule, CompaniesModule, AttachmentsModule],
  providers: [SeedService],
})
export class SeedModule {}
