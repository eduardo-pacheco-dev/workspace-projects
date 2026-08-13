import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Task, TaskProps } from '../domain/task.entity';
import {
  TaskRepository,
  TaskQuery,
  PaginatedTasks,
} from '../domain/task.repository';
import { TaskEntity } from './task.entity';

const TASK_FIELDS = [
  'id',
  'title',
  'description',
  'status',
  'priority',
  'dueAt',
  'project',
  'client',
  'assignedTo',
  'parentId',
  'createdAt',
  'updatedAt',
] as const;

const TASK_PERSISTENCE_FIELDS = TASK_FIELDS.filter(
  (field) => field !== 'createdAt' && field !== 'updatedAt',
);

const SEARCH_CLAUSE =
  't.title LIKE :search OR t.description LIKE :search OR t.project LIKE :search OR t.client LIKE :search OR t.assignedTo LIKE :search';

const ALLOWED_SORT_COLUMNS = [
  'id',
  'title',
  'status',
  'priority',
  'dueAt',
  'project',
  'client',
  'assignedTo',
];

@Injectable()
export class TypeOrmTaskRepository implements TaskRepository {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly repo: Repository<TaskEntity>,
  ) {}

  private toDomain(entity: TaskEntity): Task {
    const props: Record<string, unknown> = {};
    for (const field of TASK_FIELDS) {
      props[field] = (entity as unknown as Record<string, unknown>)[field];
    }
    if (entity.subtasks) {
      props.subtasks = entity.subtasks.map((subtask) => this.toDomain(subtask));
    }
    return new Task(props as unknown as TaskProps);
  }

  private toPersistence(task: Task): Partial<TaskEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of TASK_PERSISTENCE_FIELDS) {
      entity[field] = (task as unknown as Record<string, unknown>)[field] ?? null;
    }
    return entity as Partial<TaskEntity>;
  }

  private applyFilters(
    qb: SelectQueryBuilder<TaskEntity>,
    search: string | undefined,
    status: string | undefined,
    priority: string | undefined,
  ): void {
    qb.where('t.parentId IS NULL');
    if (search) {
      qb.andWhere(SEARCH_CLAUSE, { search: `%${search}%` });
    }
    if (status) {
      qb.andWhere('t.status = :status', { status });
    }
    if (priority) {
      qb.andWhere('t.priority = :priority', { priority });
    }
  }

  async create(task: Task): Promise<Task> {
    const entity = this.repo.create(this.toPersistence(task) as Partial<TaskEntity>);
    return this.toDomain(await this.repo.save(entity));
  }

  async save(task: Task): Promise<Task> {
    return this.toDomain(await this.repo.save(this.toPersistence(task) as Partial<TaskEntity>));
  }

  async findAll(query: TaskQuery): Promise<PaginatedTasks> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'dueAt',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
      priority,
    } = query;

    const qb = this.repo.createQueryBuilder('t');
    this.applyFilters(qb, search, status, priority);

    const safeSort = ALLOWED_SORT_COLUMNS.includes(sortBy) ? sortBy : 'dueAt';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`t.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map((entity) => this.toDomain(entity)), total };
  }

  async findById(id: number): Promise<Task | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByIdWithSubtasks(id: number): Promise<Task | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { subtasks: true },
      order: { subtasks: { createdAt: 'ASC' } },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findSubtasks(id: number): Promise<Task[]> {
    const rows = await this.repo.find({
      where: { parentId: id },
      order: { createdAt: 'ASC' },
    });
    return rows.map((entity) => this.toDomain(entity));
  }

  async findParent(id: number): Promise<Task | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async deleteWithSubtasks(id: number): Promise<boolean> {
    await this.repo.delete({ parentId: id });
    const result = await this.repo.delete(id);
    return result.affected !== 0;
  }
}
