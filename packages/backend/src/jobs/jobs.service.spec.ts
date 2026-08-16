import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './job.entity';
import { JOB_EXECUTORS } from './job-executors';

describe('JobsService', () => {
  let service: JobsService;

  const executor = {
    type: 'ECHO',
    execute: jest.fn().mockResolvedValue(undefined),
  };

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const buildPagedQueryBuilder = (data: Job[], total: number) => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([data, total]),
    };
    return qb;
  };

  const buildDueQueryBuilder = (data: Job[]) => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(data),
    };
    return qb;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: getRepositoryToken(Job), useValue: repo },
        { provide: JOB_EXECUTORS, useValue: [executor] },
      ],
    }).compile();

    service = moduleRef.get(JobsService);
  });

  describe('registro de executores', () => {
    it('should register custom executor', () => {
      const custom = {
        type: 'CUSTOM',
        execute: jest.fn(),
      };
      service.registerExecutor(custom);
      expect(service.hasExecutor('CUSTOM')).toBe(true);
    });

    it('should know registered executor types from injection', () => {
      expect(service.hasExecutor('ECHO')).toBe(true);
      expect(service.hasExecutor('UNKNOWN')).toBe(false);
    });
  });

  describe('create', () => {
    it('should create a job with default status and next run', async () => {
      const saved = { id: 1, nome: 'Limpeza', tipo: 'ECHO', status: 'ativo', empresaId: 5 };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      const result = await service.create(
        { nome: 'Limpeza', tipo: 'ECHO', cronExpression: '0 0 * * *' },
        5,
      );

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Limpeza',
          status: 'ativo',
          empresaId: 5,
          proximaExecucaoEm: expect.any(Date),
        }),
      );
      expect(result).toEqual(saved);
    });

    it('should use provided status and allow null empresaId', async () => {
      const saved = { id: 2, nome: 'X', status: 'inativo', empresaId: null };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      await service.create(
        { nome: 'X', tipo: 'ECHO', cronExpression: '0 0 * * *', status: 'inativo' },
        undefined,
      );

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'inativo', empresaId: null }),
      );
    });
  });

  describe('findAll', () => {
    it('should list jobs with pagination', async () => {
      const data = [{ id: 1, nome: 'Limpeza' }] as unknown as Job[];
      const qb = buildPagedQueryBuilder(data, 1);
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('j');
      expect(qb.orderBy).toHaveBeenCalledWith('j.id', 'DESC');
      expect(result).toEqual({ data, total: 1 });
    });

    it('should apply company, status and search filters', async () => {
      const qb = buildPagedQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ status: 'ativo', search: 'relat' }, 3);

      expect(qb.andWhere).toHaveBeenCalledWith('j.empresaId = :companyId', { companyId: 3 });
      expect(qb.andWhere).toHaveBeenCalledWith('j.status = :status', { status: 'ativo' });
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('j.nome LIKE :search'),
        { search: '%relat%' },
      );
    });

    it('should fall back to default sort when column is unknown', async () => {
      const qb = buildPagedQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ sortBy: 'unknown;DROP', sortOrder: 'ASC' });

      expect(qb.orderBy).toHaveBeenCalledWith('j.id', 'ASC');
    });
  });

  describe('findById', () => {
    it('should return the job', async () => {
      const job = { id: 1, empresaId: 5 };
      repo.findOne.mockResolvedValue(job);
      await expect(service.findById(1)).resolves.toEqual(job);
    });

    it('should throw NotFoundException when missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for job of another company', async () => {
      repo.findOne.mockResolvedValue({ id: 1, empresaId: 7 });
      await expect(service.findById(1, 5)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update job and recompute next run on cron change', async () => {
      const job = { id: 1, nome: 'Antigo', cronExpression: '0 0 * * *' } as Job;
      repo.findOne.mockResolvedValue(job);
      repo.save.mockResolvedValue({ ...job, nome: 'Novo' });

      const result = await service.update(1, { nome: 'Novo', cronExpression: '0 12 * * *' });

      expect(job.proximaExecucaoEm).toBeInstanceOf(Date);
      expect(result.nome).toBe('Novo');
    });

    it('should throw NotFoundException for missing job', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update(99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing job', async () => {
      repo.findOne.mockResolvedValue({ id: 1, empresaId: 5 });
      repo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.delete(1, 5)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when delete affects nothing', async () => {
      repo.findOne.mockResolvedValue({ id: 1, empresaId: 5 });
      repo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.delete(1, 5)).rejects.toThrow(NotFoundException);
    });
  });

  describe('runNow', () => {
    it('should run an active job', async () => {
      const job = { id: 1, tipo: 'ECHO', status: 'ativo', cronExpression: '0 0 * * *' };
      repo.findOne.mockResolvedValueOnce(job).mockResolvedValueOnce({ ...job, ultimoExecutadoEm: new Date() });
      repo.update.mockResolvedValue({ affected: 1 });

      const result = await service.runNow(1);

      expect(executor.execute).toHaveBeenCalledWith(job);
      expect(repo.update).toHaveBeenCalledWith(1, { status: 'executando' });
      expect(result.ultimoExecutadoEm).toBeInstanceOf(Date);
    });

    it('should reject running an inactive job', async () => {
      repo.findOne.mockResolvedValue({ id: 1, status: 'inativo' });
      await expect(service.runNow(1)).rejects.toThrow(ConflictException);
    });
  });

  describe('execute', () => {
    it('should skip execution when job is already running', async () => {
      const job = { id: 1, status: 'executando' };
      await service.execute(job as Job);
      expect(executor.execute).not.toHaveBeenCalled();
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should accept an id and skip when no executor exists', async () => {
      repo.findOne.mockResolvedValue({ id: 2, tipo: 'UNKNOWN', cronExpression: '0 0 * * *' });
      repo.update.mockResolvedValue({ affected: 1 });

      await service.execute(2);

      expect(repo.update).toHaveBeenCalledWith(2, { proximaExecucaoEm: expect.any(Date) });
    });

    it('should run executor and record timestamps', async () => {
      const job = { id: 3, tipo: 'ECHO', status: 'ativo', cronExpression: '0 0 * * *' };
      repo.update.mockResolvedValue({ affected: 1 });

      await service.execute(job as Job);

      expect(repo.update).toHaveBeenNthCalledWith(1, 3, { status: 'executando' });
      expect(repo.update).toHaveBeenNthCalledWith(2, 3, {
        status: 'ativo',
        ultimoExecutadoEm: expect.any(Date),
        proximaExecucaoEm: expect.any(Date),
      });
    });

    it('should restore status when executor fails', async () => {
      const job = { id: 4, tipo: 'ECHO', status: 'ativo', cronExpression: '0 0 * * *' };
      executor.execute.mockRejectedValueOnce(new Error('falha'));

      await expect(service.execute(job as Job)).rejects.toThrow('falha');
      expect(repo.update).toHaveBeenNthCalledWith(2, 4, { status: 'ativo' });
    });
  });

  describe('runDueJobs', () => {
    it('should execute due active jobs and keep going on errors', async () => {
      const due1 = { id: 1, tipo: 'ECHO', status: 'ativo', cronExpression: '0 0 * * *' };
      const due2 = { id: 2, tipo: 'ECHO', status: 'ativo', cronExpression: '0 0 * * *' };
      repo.createQueryBuilder.mockReturnValue(buildDueQueryBuilder([due1, due2] as unknown as Job[]));
      executor.execute.mockRejectedValueOnce(new Error('falha')).mockResolvedValueOnce(undefined);
      repo.update.mockResolvedValue({ affected: 1 });

      await service.runDueJobs();

      expect(executor.execute).toHaveBeenCalledTimes(2);
      expect(repo.update).toHaveBeenCalled();
    });

    it('should filter only active jobs that are due', async () => {
      repo.createQueryBuilder.mockReturnValue(buildDueQueryBuilder([]));

      await service.runDueJobs();

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('j');
    });
  });
});