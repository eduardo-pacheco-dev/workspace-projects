import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';

describe('TaskService', () => {
  let service: TaskService;

  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const buildQueryBuilder = (data: Task[], total: number) => {
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

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getRepositoryToken(Task), useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(TaskService);
  });

  describe('create', () => {
    it('should create a task with default status and priority when not provided', async () => {
      const created = { id: 1, title: 'Revisar projeto', status: 'pending', priority: 'medium' } as Task;
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(created);

      const result = await service.create({ title: 'Revisar projeto' });

      expect(repository.create).toHaveBeenCalledWith({
        title: 'Revisar projeto',
        status: 'pending',
        priority: 'medium',
      });
      expect(repository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('should create a task keeping the provided status and priority', async () => {
      const created = {
        id: 2,
        title: 'Entrega de relatório',
        status: 'in_progress',
        priority: 'high',
      } as Task;
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(created);

      const result = await service.create({ title: 'Entrega de relatório', status: 'in_progress', priority: 'high' });

      expect(repository.create).toHaveBeenCalledWith({
        title: 'Entrega de relatório',
        status: 'in_progress',
        priority: 'high',
      });
      expect(result.status).toBe('in_progress');
      expect(result.priority).toBe('high');
    });

    it('should create a subtask when the parent task exists', async () => {
      const created = {
        id: 3,
        title: 'Subtarefa',
        status: 'pending',
        priority: 'medium',
        parentId: 1,
      } as Task;
      repository.findOne.mockResolvedValue({ id: 1, title: 'Tarefa' });
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(created);

      const result = await service.create({ title: 'Subtarefa', parentId: 1 });

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ parentId: 1 }));
      expect(result.parentId).toBe(1);
    });

    it('should throw NotFoundException when creating a subtask with an unknown parent', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.create({ title: 'Subtarefa', parentId: 99 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks with default sort by dueAt ascending', async () => {
      const task = { id: 1, title: 'Tarefa', dueAt: '2026-08-03' } as Task;
      const qb = buildQueryBuilder([task], 1);
      repository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({});

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('t');
      expect(qb.orderBy).toHaveBeenCalledWith('t.dueAt', 'ASC');
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({ data: [task], total: 1 });
    });

    it('should apply search, status and priority filters', async () => {
      const task = { id: 1, title: 'Manutenção' } as Task;
      const qb = buildQueryBuilder([task], 1);
      repository.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ search: 'manu', status: 'pending', priority: 'high' });

      expect(qb.where).toHaveBeenCalledWith('t.parentId IS NULL');
      expect(qb.andWhere).toHaveBeenCalledWith(
        't.title LIKE :search OR t.description LIKE :search OR t.project LIKE :search OR t.client LIKE :search OR t.assignedTo LIKE :search',
        { search: '%manu%' },
      );
      expect(qb.andWhere).toHaveBeenCalledWith('t.status = :status', { status: 'pending' });
      expect(qb.andWhere).toHaveBeenCalledWith('t.priority = :priority', { priority: 'high' });
    });

    it('should fall back to dueAt when sortBy is not allowed', async () => {
      const qb = buildQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ sortBy: 'notAllowed', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('t.dueAt', 'DESC');
    });

    it('should use the allowed sortBy and sortOrder when provided', async () => {
      const qb = buildQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ sortBy: 'priority', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('t.priority', 'DESC');
    });
  });

  describe('findById', () => {
    it('should return the task with subtasks when found', async () => {
      const task = { id: 1, title: 'Tarefa', subtasks: [] } as unknown as Task;
      repository.findOne.mockResolvedValue(task);

      const result = await service.findById(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { subtasks: true },
        order: { subtasks: { createdAt: 'ASC' } },
      });
      expect(result).toEqual(task);
    });

    it('should throw NotFoundException when the task does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findSubtasks', () => {
    it('should return the subtasks of a task', async () => {
      repository.findOne.mockResolvedValue({ id: 1, title: 'Tarefa' });
      repository.find = jest.fn().mockResolvedValue([
        { id: 2, title: 'Subtarefa 1', parentId: 1 },
        { id: 3, title: 'Subtarefa 2', parentId: 1 },
      ]);

      const result = await service.findSubtasks(1);

      expect(repository.find).toHaveBeenCalledWith({
        where: { parentId: 1 },
        order: { createdAt: 'ASC' },
      });
      expect(result).toHaveLength(2);
    });

    it('should throw NotFoundException when the parent task does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findSubtasks(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should merge the dto into the existing task and save it', async () => {
      const task = { id: 1, title: 'Antiga', status: 'pending', priority: 'low' } as Task;
      repository.findOne.mockResolvedValue(task);
      repository.save.mockImplementation(async (t: Task) => t);

      const result = await service.update(1, { title: 'Nova', priority: 'urgent' });

      expect(task.title).toBe('Nova');
      expect(task.priority).toBe('urgent');
      expect(repository.save).toHaveBeenCalledWith(task);
      expect(result.title).toBe('Nova');
    });

    it('should throw NotFoundException when the task does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(1, { title: 'Nova' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete the subtasks and then the task when found', async () => {
      repository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete(1)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith({ parentId: 1 });
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when nothing was deleted', async () => {
      repository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });
});
