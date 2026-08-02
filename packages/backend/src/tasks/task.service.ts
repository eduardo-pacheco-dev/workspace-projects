import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskInput, UpdateTaskInput } from './task.schemas';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(dto: CreateTaskInput): Promise<Task> {
    const task = this.taskRepository.create({
      ...dto,
      status: dto.status ?? 'pending',
      priority: dto.priority ?? 'medium',
    });
    return this.taskRepository.save(task);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    status?: string;
    priority?: string;
  }): Promise<{ data: Task[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'dueAt',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
      priority,
    } = query;

    const qb = this.taskRepository.createQueryBuilder('t');

    if (search) {
      qb.where(
        't.title LIKE :search OR t.description LIKE :search OR t.project LIKE :search OR t.client LIKE :search OR t.assignedTo LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('t.status = :status', { status });
    }

    if (priority) {
      qb.andWhere('t.priority = :priority', { priority });
    }

    const allowedSort = ['id', 'title', 'status', 'priority', 'dueAt', 'project', 'client', 'assignedTo'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'dueAt';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`t.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return task;
  }

  async update(id: number, dto: UpdateTaskInput): Promise<Task> {
    const task = await this.findById(id);
    Object.assign(task, dto);
    return this.taskRepository.save(task);
  }

  async delete(id: number): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Tarefa não encontrada');
    }
  }
}
