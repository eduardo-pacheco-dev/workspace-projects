import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { JobSchedulerService } from './job-scheduler.service';
import { JobsService } from './jobs.service';

describe('JobSchedulerService', () => {
  let scheduler: JobSchedulerService;

  const jobsService = {
    runDueJobs: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        JobSchedulerService,
        { provide: JobsService, useValue: jobsService },
      ],
    }).compile();

    scheduler = moduleRef.get(JobSchedulerService);
  });

  it('should dispatch due jobs on each tick', async () => {
    jobsService.runDueJobs.mockResolvedValue(undefined);
    await scheduler.handleTick();
    expect(jobsService.runDueJobs).toHaveBeenCalledTimes(1);
  });

  it('should keep the interval alive when a run fails', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jobsService.runDueJobs.mockRejectedValue(new Error('falha no job'));
    await expect(scheduler.handleTick()).resolves.toBeUndefined();
  });
});