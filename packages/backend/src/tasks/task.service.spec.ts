import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './domain/task.entity';
import { TASK_REPOSITORY } from './domain/task.repository';

describe('TaskService', () => {
  let service: TaskService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIdWithSubtasks: jest.fn(),
    findSubtasks: jest.fn(),
    findParent: jest.fn(),
    deleteWithSubtasks: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: TASK_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(TaskService);
  });

  describe('create', () => {
    it('should create a task with defaults', async () => {
      repo.create.mockResolvedValue(
        new Task({ id: 1, title: 'Revisar projeto', status: 'pending', priority: 'medium' }),
      );

      const result = await service.create({ title: 'Revisar projeto' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Revisar projeto', status: 'pending', priority: 'medium' }),
      );
      expect(result.status).toBe('pending');
    });

    it('should check the parent when a parentId is provided', async () => {
      repo.findParent.mockResolvedValue(new Task({ id: 5, title: 'Pai' }));
      repo.create.mockImplementation(async (t) => t);

      await service.create({ title: 'Sub', parentId: 5 });

      expect(repo.findParent).toHaveBeenCalledWith(5);
    });

    it('should throw NotFoundException when the parent does not exist', async () => {
      repo.findParent.mockResolvedValue(null);

      await expect(service.create({ title: 'Sub', parentId: 99 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should delegate to the repository', async () => {
      const data = [new Task({ id: 1, title: 'A' })];
      repo.findAll.mockResolvedValue({ data, total: 1 });

      const query = { page: 1, limit: 10, search: 'a', status: 'pending', priority: 'high' };
      const result = await service.findAll(query);

      expect(repo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data, total: 1 });
    });
  });

  describe('findById', () => {
    it('should return the task with subtasks', async () => {
      const task = new Task({ id: 1, title: 'A', subtasks: [new Task({ id: 2, title: 'Sub' })] });
      repo.findByIdWithSubtasks.mockResolvedValue(task);

      await expect(service.findById(1)).resolves.toEqual(task);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findByIdWithSubtasks.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findSubtasks', () => {
    it('should return the subtasks of an existing task', async () => {
      repo.findById.mockResolvedValue(new Task({ id: 1, title: 'Pai' }));
      const subtasks = [new Task({ id: 2, title: 'Sub' })];
      repo.findSubtasks.mockResolvedValue(subtasks);

      const result = await service.findSubtasks(1);

      expect(repo.findSubtasks).toHaveBeenCalledWith(1);
      expect(result).toEqual(subtasks);
    });

    it('should throw NotFoundException when the parent does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findSubtasks(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const task = new Task({ id: 1, title: 'Antes', priority: 'low' });
      repo.findById.mockResolvedValue(task);
      repo.save.mockImplementation(async (t) => t);

      const result = await service.update(1, { title: 'Depois', status: 'completed' });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Depois' }));
      expect(result.status).toBe('completed');
    });

    it('should check the parent when moving a task under a new parent', async () => {
      repo.findById.mockResolvedValue(new Task({ id: 1, title: 'A' }));
      repo.findParent.mockResolvedValue(new Task({ id: 5, title: 'Pai' }));
      repo.save.mockImplementation(async (t) => t);

      await service.update(1, { parentId: 5 });

      expect(repo.findParent).toHaveBeenCalledWith(5);
    });

    it('should throw NotFoundException when the task does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update(99, { title: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing task', async () => {
      repo.deleteWithSubtasks.mockResolvedValue(true);

      await expect(service.delete(1)).resolves.toBeUndefined();
      expect(repo.deleteWithSubtasks).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when the task does not exist', async () => {
      repo.deleteWithSubtasks.mockResolvedValue(false);

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
