import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { FreelancersModule } from '../freelancers/freelancers.module';
import { JobsModule } from '../jobs/jobs.module';
import { SeedService } from './seed.service';

@Module({
  imports: [UsersModule, FreelancersModule, JobsModule],
  providers: [SeedService],
})
export class SeedModule {}
