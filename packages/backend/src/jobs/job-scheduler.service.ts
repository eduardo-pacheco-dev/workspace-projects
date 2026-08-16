import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { JobsService } from './jobs.service';

@Injectable()
export class JobSchedulerService {
  private readonly logger = new Logger(JobSchedulerService.name);

  constructor(private readonly jobsService: JobsService) {}

  @Interval('pdca-jobs-scheduler', 60_000)
  async handleTick(): Promise<void> {
    try {
      await this.jobsService.runDueJobs();
    } catch (error) {
      this.logger.error('Erro ao executar jobs agendados', error);
    }
  }
}