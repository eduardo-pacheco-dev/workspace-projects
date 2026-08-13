import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Task } from './domain/task.entity';
import {
  TaskRepository,
  TaskQuery,
  PaginatedTasks,
  TASK_REPOSITORY,
} from './domain/task.repository';
import { CreateTaskInput, UpdateTaskInput } from './task.schemas';

@Injectable()
export class TaskService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async create(dto: CreateTaskInput): Promise<Task> {
    if (dto.parentId != null) {
      await this.ensureParent(dto.parentId);
    }
    return this.taskRepository.create(new Task({ ...dto }));
  }

  async findAll(query: TaskQuery): Promise<PaginatedTasks> {
    return this.taskRepository.findAll(query);
  }

  async findById(id: number): Promise<Task> {
    const task = await this.taskRepository.findByIdWithSubtasks(id);
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return task;
  }

  async findSubtasks(id: number): Promise<Task[]> {
    await this.ensureTask(id);
    return this.taskRepository.findSubtasks(id);
  }

  async update(id: number, dto: UpdateTaskInput): Promise<Task> {
    const task = await this.ensureTask(id);
    if (dto.parentId != null) {
      await this.ensureParent(dto.parentId);
    }
    Object.assign(task, dto);
    return this.taskRepository.save(task);
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.taskRepository.deleteWithSubtasks(id);
    if (!deleted) throw new NotFoundException('Tarefa não encontrada');
  }

  private async ensureTask(id: number): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return task;
  }

  private async ensureParent(parentId: number): Promise<void> {
    const parent = await this.taskRepository.findParent(parentId);
    if (!parent) throw new NotFoundException('Tarefa pai não encontrada');
  }
}
