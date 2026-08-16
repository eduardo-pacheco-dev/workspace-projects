import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CronExpressionParser } from 'cron-parser';
import { Job } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JOB_EXECUTORS, JobExecutor } from './job-executors';

export interface JobQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
}

@Injectable()
export class JobsService {
  private readonly executors = new Map<string, JobExecutor>();

  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @Inject(JOB_EXECUTORS)
    executors: JobExecutor[],
  ) {
    for (const executor of executors) {
      this.executors.set(executor.type, executor);
    }
  }

  registerExecutor(executor: JobExecutor): void {
    this.executors.set(executor.type, executor);
  }

  hasExecutor(tipo: string): boolean {
    return this.executors.has(tipo);
  }

  async create(dto: CreateJobDto, empresaId?: number): Promise<Job> {
    const job = this.jobsRepository.create({
      nome: dto.nome,
      tipo: dto.tipo,
      descricao: dto.descricao ?? null,
      cronExpression: dto.cronExpression,
      status: dto.status ?? 'ativo',
      empresaId: empresaId ?? null,
      proximaExecucaoEm: this.nextRun(dto.cronExpression),
    });
    return this.jobsRepository.save(job);
  }

  async findAll(
    query: JobQuery,
    companyId?: number,
  ): Promise<{ data: Job[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'DESC' as 'ASC' | 'DESC',
      search,
      status,
    } = query;

    const qb = this.jobsRepository.createQueryBuilder('j');

    if (companyId !== undefined) {
      qb.andWhere('j.empresaId = :companyId', { companyId });
    }

    if (status) {
      qb.andWhere('j.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(j.nome LIKE :search OR j.tipo LIKE :search OR j.descricao LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const allowedSort = [
      'id',
      'nome',
      'tipo',
      'status',
      'ultimoExecutadoEm',
      'proximaExecucaoEm',
      'createdAt',
    ];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const [data, total] = await qb
      .orderBy(`j.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number, companyId?: number): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job não encontrado');
    if (companyId !== undefined && job.empresaId !== companyId) {
      throw new NotFoundException('Job não encontrado');
    }
    return job;
  }

  async update(id: number, dto: UpdateJobDto, companyId?: number): Promise<Job> {
    const job = await this.findById(id, companyId);
    Object.assign(job, dto);
    if (dto.cronExpression) {
      job.proximaExecucaoEm = this.nextRun(dto.cronExpression);
    }
    return this.jobsRepository.save(job);
  }

  async delete(id: number, companyId?: number): Promise<void> {
    await this.findById(id, companyId);
    const result = await this.jobsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Job não encontrado');
  }

  async runNow(id: number, companyId?: number): Promise<Job> {
    const job = await this.findById(id, companyId);
    if (job.status === 'inativo') {
      throw new ConflictException('Não é possível executar um job inativo');
    }
    await this.execute(job);
    return this.findById(id, companyId);
  }

  async execute(jobOrId: number | Job): Promise<void> {
    const job =
      typeof jobOrId === 'number' ? await this.findById(jobOrId) : jobOrId;

    if (job.status === 'executando') return;

    const executor = this.executors.get(job.tipo);
    if (!executor) {
      await this.jobsRepository.update(job.id, {
        proximaExecucaoEm: this.nextRun(job.cronExpression),
      });
      return;
    }

    await this.jobsRepository.update(job.id, { status: 'executando' });

    try {
      await executor.execute(job);
      await this.jobsRepository.update(job.id, {
        status: 'ativo',
        ultimoExecutadoEm: new Date(),
        proximaExecucaoEm: this.nextRun(job.cronExpression),
      });
    } catch (error) {
      await this.jobsRepository.update(job.id, { status: 'ativo' });
      throw error;
    }
  }

  async runDueJobs(): Promise<void> {
    const now = new Date();
    const jobs = await this.jobsRepository
      .createQueryBuilder('j')
      .where('j.status = :status', { status: 'ativo' })
      .andWhere('(j.proximaExecucaoEm IS NULL OR j.proximaExecucaoEm <= :now)', {
        now,
      })
      .getMany();

    for (const job of jobs) {
      try {
        await this.execute(job);
      } catch {
        // rotina falhou; o erro é registrado pelo executor e a execução segue
      }
    }
  }

  private nextRun(cronExpression: string): Date | null {
    try {
      return CronExpressionParser.parse(cronExpression).next().toDate();
    } catch {
      return null;
    }
  }
}