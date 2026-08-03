import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { Collaborator } from './collaborator.entity';

describe('CollaboratorsService', () => {
  let service: CollaboratorsService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const buildQueryBuilder = (data: Collaborator[], total: number) => {
    const qb = {
      where: jest.fn().mockReturnThis(),
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
      providers: [CollaboratorsService, { provide: getRepositoryToken(Collaborator), useValue: repo }],
    }).compile();

    service = moduleRef.get(CollaboratorsService);
  });

  describe('create', () => {
    it('should create a collaborator with ativo default and generated codigo', async () => {
      const saved = { id: 1, nome: 'João Silva', codigo: null, status: 'ativo' };
      repo.create.mockReturnValue(saved);
      repo.save
        .mockResolvedValueOnce(saved)
        .mockResolvedValueOnce({ ...saved, codigo: 'COL-0001' });

      const result = await service.create({ nome: 'João Silva' });

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ nome: 'João Silva', status: 'ativo' }));
      expect(repo.save).toHaveBeenCalledTimes(2);
      expect(result.codigo).toBe('COL-0001');
    });

    it('should not regenerate codigo when already present', async () => {
      const saved = { id: 1, nome: 'João', codigo: 'COL-0001' };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      const result = await service.create({ nome: 'João' });

      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(result.codigo).toBe('COL-0001');
    });
  });

  describe('findAllPaged', () => {
    it('should list collaborators with pagination and default sort', async () => {
      const data = [{ id: 1, nome: 'João' }];
      const qb = buildQueryBuilder(data as Collaborator[], 1);
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAllPaged({ page: 1, limit: 10 });

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('c');
      expect(qb.orderBy).toHaveBeenCalledWith('c.id', 'ASC');
      expect(result).toEqual({ data, total: 1 });
    });

    it('should apply the search filter', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaged({ search: 'joao' });

      expect(qb.where).toHaveBeenCalledWith(
        expect.stringContaining('c.nome LIKE :search'),
        { search: '%joao%' },
      );
    });

    it('should ignore unsupported sort columns', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaged({ sortBy: 'password;DROP', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('c.id', 'DESC');
    });
  });

  describe('getByIdOrFail', () => {
    it('should return the collaborator when found', async () => {
      const collaborator = { id: 1, nome: 'João' };
      repo.findOne.mockResolvedValue(collaborator);

      await expect(service.getByIdOrFail(1)).resolves.toEqual(collaborator);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.getByIdOrFail(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update existing collaborator', async () => {
      const collaborator = { id: 1, nome: 'Antigo', cargo: null };
      repo.findOne.mockResolvedValue(collaborator);
      repo.save.mockResolvedValue({ ...collaborator, cargo: 'Diretor' });

      const result = await service.update(1, { cargo: 'Diretor' });

      expect(result.cargo).toBe('Diretor');
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for missing collaborator', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update(99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing collaborator', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when collaborator does not exist', async () => {
      repo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
