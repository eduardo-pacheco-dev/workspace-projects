import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MsProject } from './ms-project.entity';
import { MsTask } from './ms-task.entity';
import { MsDependency } from './ms-dependency.entity';
import { MsResource } from './ms-resource.entity';
import { MsAssignment } from './ms-assignment.entity';
import { scheduleProject } from './scheduler';
import {
  CreateMsProjectInput,
  UpdateMsProjectInput,
  CreateMsTaskInput,
  UpdateMsTaskInput,
  CreateMsDependencyInput,
  CreateMsResourceInput,
  UpdateMsResourceInput,
  CreateMsAssignmentInput,
  UpdateMsAssignmentInput,
} from './ms-project.schemas';

const DEFAULT_WORKING_DAYS = '[1,2,3,4,5]';

export type MsProjectSummary = Omit<MsProject, 'workingDays'> & { workingDays: number[] };

export interface MsProjectDetail extends Omit<MsProject, 'workingDays'> {
  workingDays: number[];
  schedule: {
    startDate: string;
    finishDate: string;
    durationDays: number;
    criticalTasks: number[];
  };
  tasks: (MsTask & { slackDays: number | null })[];
  dependencies: MsDependency[];
  resources: MsResource[];
  assignments: MsAssignment[];
}

const pad2 = (n: number) => String(n).padStart(2, '0');

const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const parseWorkingDays = (value: string | null): number[] => {
  try {
    const parsed = JSON.parse(value ?? DEFAULT_WORKING_DAYS) as number[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [1, 2, 3, 4, 5];
  } catch {
    return [1, 2, 3, 4, 5];
  }
};

@Injectable()
export class MsProjectService {
  constructor(
    @InjectRepository(MsProject)
    private readonly projectRepository: Repository<MsProject>,
    @InjectRepository(MsTask)
    private readonly taskRepository: Repository<MsTask>,
    @InjectRepository(MsDependency)
    private readonly dependencyRepository: Repository<MsDependency>,
    @InjectRepository(MsResource)
    private readonly resourceRepository: Repository<MsResource>,
    @InjectRepository(MsAssignment)
    private readonly assignmentRepository: Repository<MsAssignment>,
  ) {}

  private async getProject(id: number): Promise<MsProject> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Plano de projeto não encontrado');
    return project;
  }

  async createPlan(dto: CreateMsProjectInput): Promise<MsProjectDetail> {
    const project = this.projectRepository.create({
      ...dto,
      startDate: dto.startDate ?? todayString(),
      workingDays: dto.workingDays ? JSON.stringify(dto.workingDays) : DEFAULT_WORKING_DAYS,
      status: 'not_started',
    });
    await this.projectRepository.save(project);
    await this.recomputeSchedule(project.id);
    return this.findPlanDetail(project.id);
  }

  async findAllPlans(query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    status?: string;
  }): Promise<{ data: MsProjectSummary[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC' as 'ASC' | 'DESC',
      search,
      status,
    } = query;

    const qb = this.projectRepository.createQueryBuilder('p');

    if (search) {
      qb.where('p.name LIKE :search OR p.description LIKE :search', { search: `%${search}%` });
    }
    if (status) {
      qb.andWhere('p.status = :status', { status });
    }

    const allowedSort = ['id', 'name', 'status', 'startDate', 'endDate', 'durationDays', 'createdAt'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`p.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map((p) => ({ ...p, workingDays: parseWorkingDays(p.workingDays) })), total };
  }

  async findPlanDetail(id: number): Promise<MsProjectDetail> {
    const project = await this.getProject(id);
    const tasks = await this.taskRepository.find({
      where: { projectId: id },
      order: { position: 'ASC', id: 'ASC' },
    });
    const dependencies = await this.dependencyRepository.find({ where: { projectId: id } });
    const resources = await this.resourceRepository.find({
      where: { projectId: id },
      order: { id: 'ASC' },
    });
    const assignments = await this.assignmentRepository.find({ where: { projectId: id } });

    const schedule = this.computeSchedule(project, tasks, dependencies);

    const tasksWithSchedule = tasks.map((task) => {
      const s = schedule.byTask.get(task.id);
      return {
        ...task,
        startDate: s?.start ?? task.startDate,
        finishDate: s?.finish ?? task.finishDate,
        critical: s?.critical ?? false,
        slackDays: s?.slackDays ?? null,
      };
    });

    return {
      ...project,
      workingDays: parseWorkingDays(project.workingDays),
      schedule: {
        startDate: schedule.startDate,
        finishDate: schedule.finishDate,
        durationDays: schedule.durationDays,
        criticalTasks: schedule.criticalTasks,
      },
      tasks: tasksWithSchedule,
      dependencies,
      resources,
      assignments,
    };
  }

  async updatePlan(id: number, dto: UpdateMsProjectInput): Promise<MsProjectDetail> {
    const project = await this.getProject(id);
    Object.assign(project, dto);
    if (dto.workingDays) {
      project.workingDays = JSON.stringify(dto.workingDays);
    }
    await this.projectRepository.save(project);
    await this.recomputeSchedule(id);
    return this.findPlanDetail(id);
  }

  async deletePlan(id: number): Promise<void> {
    await this.getProject(id);
    await this.assignmentRepository.delete({ projectId: id });
    await this.dependencyRepository.delete({ projectId: id });
    await this.taskRepository.delete({ projectId: id });
    await this.resourceRepository.delete({ projectId: id });
    await this.projectRepository.delete(id);
  }

  async recomputeSchedule(projectId: number): Promise<void> {
    const project = await this.getProject(projectId);
    const tasks = await this.taskRepository.find({ where: { projectId } });
    const dependencies = await this.dependencyRepository.find({ where: { projectId } });

    const schedule = this.computeSchedule(project, tasks, dependencies);

    for (const task of tasks) {
      const s = schedule.byTask.get(task.id);
      task.startDate = s?.start ?? null;
      task.finishDate = s?.finish ?? null;
      task.critical = s?.critical ?? false;
    }
    await this.taskRepository.save(tasks);

    project.endDate = schedule.finishDate;
    project.durationDays = schedule.durationDays;
    project.status = this.deriveStatus(tasks);
    await this.projectRepository.save(project);
  }

  private computeSchedule(
    project: MsProject,
    tasks: MsTask[],
    dependencies: MsDependency[],
  ) {
    return scheduleProject(
      project.startDate ?? todayString(),
      parseWorkingDays(project.workingDays),
      tasks.map((task) => ({
        id: task.id,
        durationDays: task.milestone ? 0 : Math.max(1, task.durationDays),
      })),
      dependencies.map((dep) => ({
        taskId: dep.taskId,
        predecessorTaskId: dep.predecessorTaskId,
        type: (dep.type as 'FS' | 'SS' | 'FF' | 'SF') || 'FS',
        lagDays: dep.lagDays,
      })),
    );
  }

  private deriveStatus(tasks: MsTask[]): string {
    if (tasks.length === 0) return 'not_started';
    if (tasks.every((task) => task.percentComplete >= 100)) return 'completed';
    const today = todayString();
    const overdue = tasks.some(
      (task) => task.percentComplete < 100 && task.finishDate && task.finishDate < today,
    );
    if (overdue) return 'behind';
    if (tasks.some((task) => task.percentComplete > 0)) return 'on_track';
    return 'not_started';
  }

  async addTask(projectId: number, dto: CreateMsTaskInput): Promise<MsProjectDetail> {
    await this.getProject(projectId);
    const last = await this.taskRepository.findOne({
      where: { projectId },
      order: { position: 'DESC' },
    });
    const task = this.taskRepository.create({
      ...dto,
      projectId,
      position: (last?.position ?? 0) + 1,
      durationDays: dto.durationDays ?? 1,
      percentComplete: dto.percentComplete ?? 0,
      priority: dto.priority ?? 'medium',
    });
    await this.taskRepository.save(task);
    await this.recomputeSchedule(projectId);
    return this.findPlanDetail(projectId);
  }

  async updateTask(id: number, dto: UpdateMsTaskInput): Promise<MsProjectDetail> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    Object.assign(task, dto);
    await this.taskRepository.save(task);
    await this.recomputeSchedule(task.projectId);
    return this.findPlanDetail(task.projectId);
  }

  async deleteTask(id: number): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    await this.assignmentRepository.delete({ taskId: id });
    await this.dependencyRepository.delete({ taskId: id });
    await this.dependencyRepository.delete({ predecessorTaskId: id });
    await this.taskRepository.delete(id);
    await this.recomputeSchedule(task.projectId);
  }

  async addDependency(projectId: number, dto: CreateMsDependencyInput): Promise<MsProjectDetail> {
    if (dto.taskId === dto.predecessorTaskId) {
      throw new BadRequestException('Uma tarefa não pode depender de si mesma.');
    }
    await this.getProject(projectId);
    const tasks = await this.taskRepository.find({ where: { projectId } });
    const ids = new Set(tasks.map((t) => t.id));
    if (!ids.has(dto.taskId) || !ids.has(dto.predecessorTaskId)) {
      throw new NotFoundException('Tarefa não encontrada');
    }
    const existing = await this.dependencyRepository.findOne({
      where: { projectId, taskId: dto.taskId, predecessorTaskId: dto.predecessorTaskId },
    });
    if (existing) {
      throw new BadRequestException('Dependência já cadastrada.');
    }
    const dependency = this.dependencyRepository.create({
      ...dto,
      projectId,
      type: dto.type ?? 'FS',
      lagDays: dto.lagDays ?? 0,
    });
    await this.dependencyRepository.save(dependency);
    await this.recomputeSchedule(projectId);
    return this.findPlanDetail(projectId);
  }

  async deleteDependency(id: number): Promise<void> {
    const dependency = await this.dependencyRepository.findOne({ where: { id } });
    if (!dependency) throw new NotFoundException('Dependência não encontrada');
    await this.dependencyRepository.delete(id);
    await this.recomputeSchedule(dependency.projectId);
  }

  async addResource(projectId: number, dto: CreateMsResourceInput): Promise<MsProjectDetail> {
    await this.getProject(projectId);
    const resource = this.resourceRepository.create({
      ...dto,
      projectId,
      type: dto.type ?? 'work',
      maxUnits: dto.maxUnits ?? 100,
    });
    await this.resourceRepository.save(resource);
    return this.findPlanDetail(projectId);
  }

  async updateResource(id: number, dto: UpdateMsResourceInput): Promise<MsProjectDetail> {
    const resource = await this.resourceRepository.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('Recurso não encontrado');
    Object.assign(resource, dto);
    await this.resourceRepository.save(resource);
    return this.findPlanDetail(resource.projectId);
  }

  async deleteResource(id: number): Promise<void> {
    const resource = await this.resourceRepository.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('Recurso não encontrado');
    await this.assignmentRepository.delete({ resourceId: id });
    await this.resourceRepository.delete(id);
  }

  async addAssignment(projectId: number, dto: CreateMsAssignmentInput): Promise<MsProjectDetail> {
    await this.getProject(projectId);
    const task = await this.taskRepository.findOne({ where: { id: dto.taskId, projectId } });
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    const resource = await this.resourceRepository.findOne({ where: { id: dto.resourceId, projectId } });
    if (!resource) throw new NotFoundException('Recurso não encontrado');
    const existing = await this.assignmentRepository.findOne({
      where: { projectId, taskId: dto.taskId, resourceId: dto.resourceId },
    });
    if (existing) {
      throw new BadRequestException('Recurso já atribuído a esta tarefa.');
    }
    const assignment = this.assignmentRepository.create({
      ...dto,
      projectId,
      units: dto.units ?? 100,
      actualWork: dto.actualWork ?? 0,
    });
    await this.assignmentRepository.save(assignment);
    return this.findPlanDetail(projectId);
  }

  async updateAssignment(id: number, dto: UpdateMsAssignmentInput): Promise<MsProjectDetail> {
    const assignment = await this.assignmentRepository.findOne({ where: { id } });
    if (!assignment) throw new NotFoundException('Atribuição não encontrada');
    Object.assign(assignment, dto);
    await this.assignmentRepository.save(assignment);
    return this.findPlanDetail(assignment.projectId);
  }

  async deleteAssignment(id: number): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({ where: { id } });
    if (!assignment) throw new NotFoundException('Atribuição não encontrada');
    await this.assignmentRepository.delete(id);
  }
}
