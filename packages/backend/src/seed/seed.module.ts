import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { FreelancersModule } from '../freelancers/freelancers.module';
import { JobsModule } from '../jobs/jobs.module';
import { LpuModule } from '../lpu/lpu.module';
import { SeedService } from './seed.service';

@Module({
  imports: [UsersModule, FreelancersModule, JobsModule, LpuModule],
  providers: [SeedService],
})
export class SeedModule {}
