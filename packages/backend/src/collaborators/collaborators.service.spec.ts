import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { Collaborator } from './collaborator.entity';
import { Company } from '../companies/company.entity';

describe('CollaboratorsService', () => {
  let service: CollaboratorsService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const companyRepo = {
    findOne: jest.fn(),
  };

  const buildQueryBuilder = (data: Collaborator[], total: number) => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
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
        CollaboratorsService,
        { provide: getRepositoryToken(Collaborator), useValue: repo },
        { provide: getRepositoryToken(Company), useValue: companyRepo },
      ],
    }).compile();

    service = moduleRef.get(CollaboratorsService);
  });

  describe('create', () => {
    it('should create a collaborator with ativo default and generated codigo', async () => {
      const saved = { id: 1, nome: 'João Silva', codigo: null, status: 'ativo', companyId: 1 };
      companyRepo.findOne.mockResolvedValue({ id: 1, nome: 'EA Projetos' });
      repo.create.mockReturnValue(saved);
      repo.save
        .mockResolvedValueOnce(saved)
        .mockResolvedValueOnce({ ...saved, codigo: 'COL-0001' });

      const result = await service.create({ nome: 'João Silva', companyId: 1 });

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ nome: 'João Silva', status: 'ativo', companyId: 1 }));
      expect(repo.save).toHaveBeenCalledTimes(2);
      expect(result.codigo).toBe('COL-0001');
    });

    it('should not regenerate codigo when already present', async () => {
      const saved = { id: 1, nome: 'João', codigo: 'COL-0001', companyId: 1 };
      companyRepo.findOne.mockResolvedValue({ id: 1 });
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      const result = await service.create({ nome: 'João', companyId: 1 });

      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(result.codigo).toBe('COL-0001');
    });

    it('should keep the provided status instead of the default', async () => {
      const saved = { id: 1, nome: 'João', codigo: null, status: 'inativo', companyId: 1 };
      companyRepo.findOne.mockResolvedValue({ id: 1 });
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValueOnce(saved).mockResolvedValueOnce({ ...saved, codigo: 'COL-0001' });

      const result = await service.create({ nome: 'João', status: 'inativo', companyId: 1 });

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'inativo' }));
      expect(result.status).toBe('inativo');
    });

    it('should throw when company does not exist', async () => {
      companyRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ nome: 'João', companyId: 99 })).rejects.toThrow(BadRequestException);
    });

    it('should reject non-master creating for another company', async () => {
      await expect(
        service.create({ nome: 'João', companyId: 2 }, { role: 'user', companyId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should force company for non-master', async () => {
      const saved = { id: 1, nome: 'João', codigo: 'COL-0001', companyId: 1 };
      companyRepo.findOne.mockResolvedValue({ id: 1 });
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      const result = await service.create({ nome: 'João', companyId: 1 }, { role: 'user', companyId: 1 });

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ companyId: 1 }));
      expect(result.companyId).toBe(1);
    });

    it('should create a freelancer with isFreelancer true and FR codigo', async () => {
      const saved = { id: 1, nome: 'Carlos Silva', codigo: null, isFreelancer: true, companyId: 1 };
      companyRepo.findOne.mockResolvedValue({ id: 1 });
      repo.create.mockReturnValue(saved);
      repo.save
        .mockResolvedValueOnce(saved)
        .mockResolvedValueOnce({ ...saved, codigo: 'FR-0001' });

      const result = await service.create({
        nome: 'Carlos Silva',
        companyId: 1,
        isFreelancer: true,
        hourlyRate: 150,
        experienceLevel: 'senior',
        availability: 'available',
      });

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ isFreelancer: true, hourlyRate: 150 }));
      expect(result.codigo).toBe('FR-0001');
    });

    it('should derive nome from firstName and lastName when creating a freelancer', async () => {
      const saved = { id: 1, nome: 'Carlos Silva', codigo: null, isFreelancer: true, companyId: 1 };
      companyRepo.findOne.mockResolvedValue({ id: 1 });
      repo.create.mockReturnValue(saved);
      repo.save
        .mockResolvedValueOnce(saved)
        .mockResolvedValueOnce({ ...saved, codigo: 'FR-0001' });

      const result = await service.create({
        firstName: 'Carlos',
        lastName: 'Silva',
        companyId: 1,
        isFreelancer: true,
      });

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Carlos Silva' }));
      expect(result.codigo).toBe('FR-0001');
    });

    it('should apply freelancer defaults for skills, portfolio, experienceLevel and availability', async () => {
      const saved = { id: 1, nome: 'Carlos Silva', codigo: null, isFreelancer: true, companyId: 1 };
      companyRepo.findOne.mockResolvedValue({ id: 1 });
      repo.create.mockReturnValue(saved);
      repo.save
        .mockResolvedValueOnce(saved)
        .mockResolvedValueOnce({ ...saved, codigo: 'FR-0001' });

      await service.create({
        firstName: 'Carlos',
        lastName: 'Silva',
        companyId: 1,
        isFreelancer: true,
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: '[]',
          portfolio: '[]',
          experienceLevel: 'junior',
          availability: 'available',
        }),
      );
    });

    it('should not apply freelancer defaults for a collaborator', async () => {
      const saved = { id: 1, nome: 'João', codigo: null, isFreelancer: false, companyId: 1 };
      companyRepo.findOne.mockResolvedValue({ id: 1 });
      repo.create.mockReturnValue(saved);
      repo.save
        .mockResolvedValueOnce(saved)
        .mockResolvedValueOnce({ ...saved, codigo: 'COL-0001' });

      await service.create({ nome: 'João', companyId: 1 });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: undefined,
          portfolio: undefined,
          experienceLevel: undefined,
          availability: undefined,
        }),
      );
    });
  });

  describe('findAllPaged', () => {
    it('should list collaborators with pagination and default sort', async () => {
      const data = [{ id: 1, nome: 'João' }];
      const qb = buildQueryBuilder(data as Collaborator[], 1);
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAllPaged({ page: 1, limit: 10 });

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('c');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('c.company', 'company');
      expect(qb.orderBy).toHaveBeenCalledWith('c.id', 'ASC');
      expect(result).toEqual({ data, total: 1 });
    });

    it('should apply the search filter', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaged({ search: 'joao' }, { role: 'master', companyId: null });

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

    it('should support ascending order', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaged({ sortBy: 'nome', sortOrder: 'ASC' });

      expect(qb.orderBy).toHaveBeenCalledWith('c.nome', 'ASC');
    });

    it('should filter by company for non-master', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaged({}, { role: 'user', companyId: 1 });

      expect(qb.where).toHaveBeenCalledWith('c.companyId = :companyId', { companyId: 1 });
    });

    it('should filter by isFreelancer', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaged({ isFreelancer: true }, { role: 'master', companyId: null });

      expect(qb.where).toHaveBeenCalledWith('c.isFreelancer = :isFreelancer', { isFreelancer: true });
    });

    it('should combine isFreelancer and search without losing the filter (master)', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaged({ isFreelancer: true, search: 'carlos' }, { role: 'master', companyId: null });

      expect(qb.where).toHaveBeenCalledWith('c.isFreelancer = :isFreelancer', { isFreelancer: true });
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('c.nome LIKE :search'),
        { search: '%carlos%' },
      );
    });

    it('should keep company and isFreelancer filters when searching (non-master)', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaged({ isFreelancer: true, search: 'carlos' }, { role: 'user', companyId: 1 });

      expect(qb.where).toHaveBeenCalledWith('c.companyId = :companyId', { companyId: 1 });
      expect(qb.andWhere).toHaveBeenCalledTimes(2);
    });

    it('should allow sorting by freelancer columns', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaged({ sortBy: 'hourlyRate', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('c.hourlyRate', 'DESC');
    });
  });

  describe('getByIdOrFail', () => {
    it('should return the collaborator when found', async () => {
      const collaborator = { id: 1, nome: 'João', companyId: 1 };
      repo.findOne.mockResolvedValue(collaborator);

      await expect(service.getByIdOrFail(1)).resolves.toEqual(collaborator);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.getByIdOrFail(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for collaborator from another company (non-master)', async () => {
      repo.findOne.mockResolvedValue({ id: 1, nome: 'João', companyId: 2 });
      await expect(service.getByIdOrFail(1, { role: 'user', companyId: 1 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFreelancerOrFail', () => {
    it('should return the freelancer when found', async () => {
      const freelancer = { id: 1, nome: 'Carlos', isFreelancer: true, companyId: 1 };
      repo.findOne.mockResolvedValue(freelancer);

      await expect(service.getFreelancerOrFail(1)).resolves.toEqual(freelancer);
    });

    it('should throw NotFoundException for a non-freelancer collaborator', async () => {
      repo.findOne.mockResolvedValue({ id: 1, nome: 'João', isFreelancer: false, companyId: 1 });

      await expect(service.getFreelancerOrFail(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when freelancer does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.getFreelancerOrFail(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update existing collaborator', async () => {
      const collaborator = { id: 1, nome: 'Antigo', cargo: null, companyId: 1 };
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

    it('should validate company on update', async () => {
      const collaborator = { id: 1, nome: 'João', companyId: 1 };
      repo.findOne.mockResolvedValue(collaborator);
      companyRepo.findOne.mockResolvedValue({ id: 2 });

      await service.update(1, { companyId: 2 });

      expect(companyRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
    });

    it('should derive nome when updating firstName/lastName', async () => {
      const collaborator = { id: 1, nome: 'Antigo Nome', firstName: 'Antigo', lastName: 'Nome', companyId: 1 };
      repo.findOne.mockResolvedValue(collaborator);
      repo.save.mockResolvedValue({ ...collaborator, firstName: 'Novo', nome: 'Novo Nome' });

      const result = await service.update(1, { firstName: 'Novo' });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Novo Nome' }));
      expect(result.nome).toBe('Novo Nome');
    });

    it('should keep existing nome when firstName/lastName unchanged', async () => {
      const collaborator = { id: 1, nome: 'João', companyId: 1 };
      repo.findOne.mockResolvedValue(collaborator);
      repo.save.mockResolvedValue({ ...collaborator, cargo: 'Diretor' });

      const result = await service.update(1, { cargo: 'Diretor' });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ nome: 'João' }));
      expect(result.nome).toBe('João');
    });
  });

  describe('delete', () => {
    it('should delete an existing collaborator', async () => {
      repo.findOne.mockResolvedValue({ id: 1, nome: 'João', companyId: 1 });
      repo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when collaborator does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for collaborator from another company (non-master)', async () => {
      repo.findOne.mockResolvedValue({ id: 1, nome: 'João', companyId: 2 });
      await expect(service.delete(1, { role: 'user', companyId: 1 })).rejects.toThrow(NotFoundException);
    });
  });
});
