import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

export interface JobQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  experienceLevel?: string;
  budgetType?: string;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  async create(dto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepository.create({
      ...dto,
      skills: dto.skills ?? '[]',
      experienceLevel: dto.experienceLevel ?? 'junior',
      status: dto.status ?? 'open',
    });
    return this.jobsRepository.save(job);
  }

  async findAll(query: JobQuery): Promise<{ data: Job[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'DESC' as 'ASC' | 'DESC',
      search,
      status,
      experienceLevel,
      budgetType,
    } = query;

    const qb = this.jobsRepository.createQueryBuilder('j');

    if (search) {
      qb.where(
        'j.title LIKE :search OR j.description LIKE :search OR j.skills LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('j.status = :status', { status });
    }

    if (experienceLevel) {
      qb.andWhere('j.experienceLevel = :experienceLevel', { experienceLevel });
    }

    if (budgetType) {
      qb.andWhere('j.budgetType = :budgetType', { budgetType });
    }

    const allowedSort = ['id', 'title', 'budget', 'status', 'experienceLevel', 'budgetType', 'createdAt'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const [data, total] = await qb
      .orderBy(`j.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(id: number, dto: UpdateJobDto): Promise<Job> {
    const job = await this.findById(id);
    Object.assign(job, dto);
    return this.jobsRepository.save(job);
  }

  async delete(id: number): Promise<void> {
    const result = await this.jobsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Job not found');
  }
}
