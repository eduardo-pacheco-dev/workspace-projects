import { Logger } from '@nestjs/common';
import { Job } from './job.entity';
import { EchoJobExecutor, CleanupLogsJobExecutor } from './job-executors';

describe('JobExecutors', () => {
  const job = { id: 1, nome: 'Rotina Teste', tipo: 'ECHO' } as Job;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should expose the expected executor types', () => {
    expect(new EchoJobExecutor().type).toBe('ECHO');
    expect(new CleanupLogsJobExecutor().type).toBe('CLEANUP_LOGS');
  });

  it('EchoJobExecutor should resolve without throwing', async () => {
    await expect(new EchoJobExecutor().execute(job)).resolves.toBeUndefined();
  });

  it('CleanupLogsJobExecutor should resolve without throwing', async () => {
    await expect(new CleanupLogsJobExecutor().execute(job)).resolves.toBeUndefined();
  });
});