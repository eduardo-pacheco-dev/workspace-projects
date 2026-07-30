import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

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

  async findAll(): Promise<Job[]> {
    return this.jobsRepository.find();
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
