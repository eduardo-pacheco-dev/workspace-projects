import { Injectable, Logger } from '@nestjs/common';
import { Job } from './job.entity';

export const JOB_EXECUTORS = 'JOB_EXECUTORS' as const;

export interface JobExecutor {
  readonly type: string;
  execute(job: Job): Promise<void>;
}

@Injectable()
export class EchoJobExecutor implements JobExecutor {
  readonly type = 'ECHO';

  private readonly logger = new Logger(EchoJobExecutor.name);

  async execute(job: Job): Promise<void> {
    this.logger.log(`[ECHO] "${job.nome}" executado em ${new Date().toISOString()}`);
  }
}

@Injectable()
export class CleanupLogsJobExecutor implements JobExecutor {
  readonly type = 'CLEANUP_LOGS';

  private readonly logger = new Logger(CleanupLogsJobExecutor.name);

  async execute(job: Job): Promise<void> {
    this.logger.log(`[CLEANUP_LOGS] Rotina "${job.nome}" executada em ${new Date().toISOString()}`);
  }
}