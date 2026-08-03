import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './company.entity';

describe('CompanyService', () => {
  let service: CompanyService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const buildQueryBuilder = (data: Company[], total: number) => {
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
      providers: [CompanyService, { provide: getRepositoryToken(Company), useValue: repo }],
    }).compile();

    service = moduleRef.get(CompanyService);
  });

  describe('create', () => {
    it('should create a company with ativa default true', async () => {
      const company = { id: 1, nome: 'EA Projetos Telecom', ativa: true };
      repo.create.mockReturnValue(company);
      repo.save.mockResolvedValue(company);

      const result = await service.create({ nome: 'EA Projetos Telecom' });

      expect(repo.create).toHaveBeenCalledWith({ nome: 'EA Projetos Telecom', ativa: true });
      expect(result).toEqual(company);
    });
  });

  describe('findAll', () => {
    it('should list companies with pagination and default sort', async () => {
      const data = [{ id: 1, nome: 'Empresa A' }];
      const qb = buildQueryBuilder(data as Company[], 1);
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('c');
      expect(qb.orderBy).toHaveBeenCalledWith('c.nome', 'ASC');
      expect(result).toEqual({ data, total: 1 });
    });

    it('should apply search filter', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ search: 'telecom' });

      expect(qb.where).toHaveBeenCalledWith(
        expect.stringContaining('c.nome LIKE :search'),
        { search: '%telecom%' },
      );
    });

    it('should ignore unsupported sort columns', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ sortBy: 'hack;DROP', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('c.nome', 'DESC');
    });
  });

  describe('findById', () => {
    it('should return the company', async () => {
      const company = { id: 1, nome: 'Empresa A' };
      repo.findOne.mockResolvedValue(company);

      const result = await service.findById(1);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(company);
    });

    it('should throw when company not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update existing company', async () => {
      const company = { id: 1, nome: 'Antiga', ativa: true };
      repo.findOne.mockResolvedValue(company);
      repo.save.mockResolvedValue({ ...company, nome: 'Nova' });

      const result = await service.update(1, { nome: 'Nova' });

      expect(result.nome).toBe('Nova');
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete existing company', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw when company not found', async () => {
      repo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
