import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobSchedulerService } from './job-scheduler.service';
import { JOB_EXECUTORS, EchoJobExecutor, CleanupLogsJobExecutor } from './job-executors';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  controllers: [JobsController],
  providers: [
    JobsService,
    JobSchedulerService,
    { provide: JOB_EXECUTORS, useClass: EchoJobExecutor, multi: true } as any,
    { provide: JOB_EXECUTORS, useClass: CleanupLogsJobExecutor, multi: true } as any,
  ],
  exports: [JobsService],
})
export class JobsModule {}