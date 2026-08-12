import { Task } from './task.entity';

export const TASK_REPOSITORY = 'TASK_REPOSITORY';

export interface TaskQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  priority?: string;
}

export interface PaginatedTasks {
  data: Task[];
  total: number;
}

export interface TaskRepository {
  create(task: Task): Promise<Task>;
  save(task: Task): Promise<Task>;
  findAll(query: TaskQuery): Promise<PaginatedTasks>;
  findById(id: number): Promise<Task | null>;
  findByIdWithSubtasks(id: number): Promise<Task | null>;
  findSubtasks(id: number): Promise<Task[]>;
  findParent(id: number): Promise<Task | null>;
  deleteWithSubtasks(id: number): Promise<boolean>;
}
