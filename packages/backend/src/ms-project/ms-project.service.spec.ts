import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MsProjectService } from './ms-project.service';
import { MsProject } from './ms-project.entity';
import { MsTask } from './ms-task.entity';
import { MsDependency } from './ms-dependency.entity';
import { MsResource } from './ms-resource.entity';
import { MsAssignment } from './ms-assignment.entity';

describe('MsProjectService', () => {
  let service: MsProjectService;

  const projectRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const taskRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };
  const depRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };
  const resourceRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };
  const assignRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const buildQueryBuilder = (data: MsProject[], total: number) => {
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

  const makeTask = (id: number, name: string, durationDays = 1, milestone = false, percentComplete = 0): MsTask =>
    ({ id, projectId: 1, name, durationDays, milestone, percentComplete, priority: 'medium', notes: null, startDate: null, finishDate: null, critical: false, position: id, createdAt: new Date(), updatedAt: new Date() }) as MsTask;

  const makeProject = (): MsProject =>
    ({ id: 1, name: 'Projeto', description: null, startDate: '2026-08-03', endDate: null, durationDays: null, status: 'not_started', workingDays: '[1,2,3,4,5]', createdAt: new Date(), updatedAt: new Date() }) as MsProject;

  beforeEach(async () => {
    jest.clearAllMocks();
    projectRepo.createQueryBuilder.mockReturnValue(buildQueryBuilder([], 0));

    const moduleRef = await Test.createTestingModule({
      providers: [
        MsProjectService,
        { provide: getRepositoryToken(MsProject), useValue: projectRepo },
        { provide: getRepositoryToken(MsTask), useValue: taskRepo },
        { provide: getRepositoryToken(MsDependency), useValue: depRepo },
        { provide: getRepositoryToken(MsResource), useValue: resourceRepo },
        { provide: getRepositoryToken(MsAssignment), useValue: assignRepo },
      ],
    }).compile();

    service = moduleRef.get(MsProjectService);
  });

  describe('createPlan', () => {
    it('should create a plan with defaults and recompute the schedule', async () => {
      const project = makeProject();
      projectRepo.create.mockReturnValue(project);
      projectRepo.save.mockResolvedValue(project);
      projectRepo.findOne.mockResolvedValue(project);
      taskRepo.find.mockResolvedValue([]);
      depRepo.find.mockResolvedValue([]);
      resourceRepo.find.mockResolvedValue([]);
      assignRepo.find.mockResolvedValue([]);

      const result = await service.createPlan({ name: 'Projeto' });

      expect(projectRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Projeto',
          startDate: expect.any(String),
          workingDays: '[1,2,3,4,5]',
          status: 'not_started',
        }),
      );
      expect(result).toHaveProperty('schedule');
      expect(result.schedule.durationDays).toBe(0);
    });

    it('should serialize workingDays as JSON', async () => {
      const project = makeProject();
      projectRepo.create.mockReturnValue(project);
      projectRepo.save.mockResolvedValue(project);
      projectRepo.findOne.mockResolvedValue(project);
      taskRepo.find.mockResolvedValue([]);
      depRepo.find.mockResolvedValue([]);
      resourceRepo.find.mockResolvedValue([]);
      assignRepo.find.mockResolvedValue([]);

      await service.createPlan({ name: 'Projeto', workingDays: [1, 2, 3, 4, 5, 6] });

      expect(projectRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ workingDays: '[1,2,3,4,5,6]' }),
      );
    });
  });

  describe('recomputeSchedule', () => {
    it('should persist computed dates, critical flag and project summary', async () => {
      const project = makeProject();
      project.startDate = '2026-07-20';
      const t1 = makeTask(1, 'Levantamento', 2, false, 100);
      const t2 = makeTask(2, 'Projeto', 3, false, 0);
      projectRepo.findOne.mockResolvedValue(project);
      taskRepo.find.mockResolvedValue([t1, t2]);
      depRepo.find.mockResolvedValue([{ id: 1, projectId: 1, taskId: 2, predecessorTaskId: 1, type: 'FS', lagDays: 0 } as MsDependency]);
      taskRepo.save.mockImplementation(async (tasks: MsTask[]) => tasks);
      projectRepo.save.mockResolvedValue(project);

      await service.recomputeSchedule(1);

      expect(taskRepo.save).toHaveBeenCalled();
      expect(t1.startDate).toBe('2026-07-20');
      expect(t1.finishDate).toBe('2026-07-21');
      expect(t2.startDate).toBe('2026-07-22');
      expect(t2.finishDate).toBe('2026-07-24');
      expect(t2.critical).toBe(true);
      expect(project.endDate).toBe('2026-07-24');
      expect(project.durationDays).toBe(5);
      expect(project.status).toBe('behind'); // t2 finished before today and is incomplete
      expect(projectRepo.save).toHaveBeenCalledWith(project);
    });

    it('should derive status as completed when all tasks are complete', async () => {
      const project = makeProject();
      const t1 = makeTask(1, 'T1', 1, false, 100);
      projectRepo.findOne.mockResolvedValue(project);
      taskRepo.find.mockResolvedValue([t1]);
      depRepo.find.mockResolvedValue([]);
      taskRepo.save.mockImplementation(async (tasks: MsTask[]) => tasks);
      projectRepo.save.mockResolvedValue(project);

      await service.recomputeSchedule(1);

      expect(project.status).toBe('completed');
    });
  });

  describe('addTask', () => {
    it('should create a task with incremented position and recompute', async () => {
      const project = makeProject();
      const last = makeTask(1, 'T1', 1, false, 0);
      projectRepo.findOne.mockResolvedValue(project);
      taskRepo.findOne
        .mockResolvedValueOnce(last) // last position lookup
        .mockResolvedValueOnce(null); // not used afterwards
      const task = makeTask(2, 'T2', 2, false, 0);
      taskRepo.create.mockReturnValue(task);
      taskRepo.save.mockResolvedValue(task);
      taskRepo.find.mockResolvedValue([last, task]);
      depRepo.find.mockResolvedValue([]);
      resourceRepo.find.mockResolvedValue([]);
      assignRepo.find.mockResolvedValue([]);

      const result = await service.addTask(1, { name: 'T2', durationDays: 2 });

      expect(taskRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'T2', projectId: 1, position: 2 }),
      );
      expect(result).toHaveProperty('tasks');
      expect(result.tasks.length).toBe(2);
    });
  });

  describe('addDependency', () => {
    it('should reject self-dependencies', async () => {
      await expect(
        service.addDependency(1, { taskId: 5, predecessorTaskId: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject dependencies on unknown tasks', async () => {
      projectRepo.findOne.mockResolvedValue(makeProject());
      taskRepo.find.mockResolvedValue([makeTask(1, 'T1')]);

      await expect(
        service.addDependency(1, { taskId: 1, predecessorTaskId: 99 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject duplicate dependencies', async () => {
      projectRepo.findOne.mockResolvedValue(makeProject());
      taskRepo.find.mockResolvedValue([makeTask(1, 'T1'), makeTask(2, 'T2')]);
      depRepo.findOne.mockResolvedValue({ id: 1 } as MsDependency);

      await expect(
        service.addDependency(1, { taskId: 2, predecessorTaskId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a dependency with defaults', async () => {
      const project = makeProject();
      const t1 = makeTask(1, 'T1');
      const t2 = makeTask(2, 'T2');
      projectRepo.findOne.mockResolvedValue(project);
      taskRepo.find.mockResolvedValue([t1, t2]);
      depRepo.findOne.mockResolvedValue(null);
      depRepo.create.mockReturnValue({ id: 1 } as MsDependency);
      depRepo.save.mockResolvedValue({ id: 1 } as MsDependency);
      depRepo.find.mockResolvedValue([{ id: 1, projectId: 1, taskId: 2, predecessorTaskId: 1, type: 'FS', lagDays: 0 } as MsDependency]);
      taskRepo.find.mockResolvedValue([t1, t2]);
      resourceRepo.find.mockResolvedValue([]);
      assignRepo.find.mockResolvedValue([]);

      const result = await service.addDependency(1, { taskId: 2, predecessorTaskId: 1 });

      expect(depRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 1, taskId: 2, predecessorTaskId: 1, type: 'FS', lagDays: 0 }),
      );
      expect(result).toHaveProperty('dependencies');
      expect(result.dependencies.length).toBe(1);
    });
  });

  describe('addAssignment', () => {
    it('should reject assignments for unknown tasks or resources', async () => {
      projectRepo.findOne.mockResolvedValue(makeProject());
      taskRepo.findOne.mockResolvedValue(null);

      await expect(
        service.addAssignment(1, { taskId: 99, resourceId: 1 }),
      ).rejects.toThrow(NotFoundException);

      taskRepo.findOne.mockResolvedValue(makeTask(1, 'T1'));
      resourceRepo.findOne.mockResolvedValue(null);

      await expect(
        service.addAssignment(1, { taskId: 1, resourceId: 99 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create an assignment with default units', async () => {
      const project = makeProject();
      projectRepo.findOne.mockResolvedValue(project);
      taskRepo.findOne.mockResolvedValue(makeTask(1, 'T1'));
      resourceRepo.findOne.mockResolvedValue({ id: 1, projectId: 1 } as MsResource);
      assignRepo.findOne.mockResolvedValue(null);
      assignRepo.create.mockReturnValue({ id: 1 } as MsAssignment);
      assignRepo.save.mockResolvedValue({ id: 1 } as MsAssignment);
      assignRepo.find.mockResolvedValue([{ id: 1, projectId: 1, taskId: 1, resourceId: 1, units: 100, actualWork: 0 } as MsAssignment]);
      taskRepo.find.mockResolvedValue([makeTask(1, 'T1')]);
      depRepo.find.mockResolvedValue([]);
      resourceRepo.find.mockResolvedValue([]);

      const result = await service.addAssignment(1, { taskId: 1, resourceId: 1 });

      expect(assignRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 1, units: 100, actualWork: 0 }),
      );
      expect(result).toHaveProperty('assignments');
      expect(result.assignments.length).toBe(1);
    });
  });

  describe('deletePlan', () => {
    it('should delete the plan and all children', async () => {
      projectRepo.findOne.mockResolvedValue(makeProject());

      await service.deletePlan(1);

      expect(assignRepo.delete).toHaveBeenCalledWith({ projectId: 1 });
      expect(depRepo.delete).toHaveBeenCalledWith({ projectId: 1 });
      expect(taskRepo.delete).toHaveBeenCalledWith({ projectId: 1 });
      expect(resourceRepo.delete).toHaveBeenCalledWith({ projectId: 1 });
      expect(projectRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when the plan does not exist', async () => {
      projectRepo.findOne.mockResolvedValue(null);

      await expect(service.deletePlan(1)).rejects.toThrow(NotFoundException);
    });
  });
});
