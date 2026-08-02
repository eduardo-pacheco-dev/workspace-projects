import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { FreelancersModule } from '../freelancers/freelancers.module';
import { JobsModule } from '../jobs/jobs.module';
import { LpuModule } from '../lpu/lpu.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { SeedService } from './seed.service';

@Module({
  imports: [UsersModule, FreelancersModule, JobsModule, LpuModule, ScheduleModule],
  providers: [SeedService],
})
export class SeedModule {}
