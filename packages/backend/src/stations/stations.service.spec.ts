import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { StationsService } from './stations.service';
import { Station } from './station.entity';

describe('StationsService', () => {
  let service: StationsService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const buildQueryBuilder = (data: Station[], total: number) => {
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
        StationsService,
        { provide: getRepositoryToken(Station), useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(StationsService);
  });

  describe('create', () => {
    it('should create a station with ativo default', async () => {
      const saved = { id: 1, siteId: 'SITE-001', endId: 'END-001', status: 'ativo' };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      const result = await service.create({ siteId: 'SITE-001', endId: 'END-001' });

      expect(repo.create).toHaveBeenCalledWith({ siteId: 'SITE-001', endId: 'END-001' });
      expect(result.status).toBe('ativo');
    });
  });

  describe('importStations', () => {
    it('should insert new stations and update existing ones', async () => {
      repo.find.mockResolvedValue([{ id: 1, siteId: 'SITE-001', endId: 'END-001' }]);
      repo.insert.mockResolvedValue({});
      repo.update.mockResolvedValue({});

      const result = await service.importStations([
        { siteId: 'SITE-001', endId: 'END-001', operadora: 'TIM', status: 'inativo' },
        { siteId: 'SITE-002', endId: 'END-002', operadora: 'CLARO' },
      ]);

      expect(result).toEqual({ imported: 1, updated: 1, skipped: 0, errors: [] });
      expect(repo.update).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'inativo', operadora: 'TIM' }));
      expect(repo.insert).toHaveBeenCalledWith([
        expect.objectContaining({ siteId: 'SITE-002', endId: 'END-002', operadora: 'CLARO', status: 'ativo' }),
      ]);
    });

    it('should skip rows without siteId or endId and report errors', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.importStations([
        { siteId: '', endId: 'END-003' },
        { siteId: 'SITE-004', endId: '' },
      ]);

      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(2);
      expect(result.errors).toEqual([
        'Linha 1: Site ID e End ID são obrigatórios.',
        'Linha 2: Site ID e End ID são obrigatórios.',
      ]);
      expect(repo.insert).not.toHaveBeenCalled();
    });

    it('should insert only once when the same key repeats within the file', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.importStations([
        { siteId: 'SITE-010', endId: 'END-010', operadora: 'TIM' },
        { siteId: 'SITE-010', endId: 'END-010', operadora: 'VIVO' },
      ]);

      expect(result.imported).toBe(1);
      expect(repo.insert).toHaveBeenCalledTimes(1);
      expect(repo.insert).toHaveBeenCalledWith([
        expect.objectContaining({ siteId: 'SITE-010', endId: 'END-010' }),
      ]);
    });

    it('should default status to ativo and parse coordinates', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.importStations([
        { siteId: 'SITE-020', endId: 'END-020', latitude: '-23.55', longitude: '-46.63' },
      ]);

      expect(result.imported).toBe(1);
      expect(repo.insert).toHaveBeenCalledWith([
        expect.objectContaining({ status: 'ativo', latitude: -23.55, longitude: -46.63 }),
      ]);
    });

    it('should ignore invalid coordinates', async () => {
      repo.find.mockResolvedValue([]);

      await service.importStations([
        { siteId: 'SITE-030', endId: 'END-030', latitude: 'abc', longitude: '' },
      ]);

      expect(repo.insert).toHaveBeenCalledWith([
        expect.objectContaining({ latitude: undefined, longitude: undefined }),
      ]);
    });

    it('should not call the database when all rows are invalid', async () => {
      const result = await service.importStations([{ siteId: '  ' }]);

      expect(result.skipped).toBe(1);
      expect(repo.find).not.toHaveBeenCalled();
      expect(repo.insert).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should list stations with pagination and default sort', async () => {
      const data = [{ id: 1, siteId: 'SITE-001' }];
      const qb = buildQueryBuilder(data as Station[], 1);
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('s');
      expect(qb.orderBy).toHaveBeenCalledWith('s.id', 'ASC');
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({ data, total: 1 });
    });

    it('should apply the search filter', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ search: 'site-001' });

      expect(qb.where).toHaveBeenCalledWith(
        expect.stringContaining('s.siteId LIKE :search'),
        { search: '%site-001%' },
      );
    });

    it('should apply status and operadora filters', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ status: 'inativo', operadora: 'TIM' });

      expect(qb.andWhere).toHaveBeenCalledWith('s.status = :status', { status: 'inativo' });
      expect(qb.andWhere).toHaveBeenCalledWith('s.operadora = :operadora', { operadora: 'TIM' });
    });

    it('should ignore unsupported sort columns', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ sortBy: 'DROP TABLE', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('s.id', 'DESC');
    });

    it('should support allowed sort columns', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ sortBy: 'siteId', sortOrder: 'ASC' });

      expect(qb.orderBy).toHaveBeenCalledWith('s.siteId', 'ASC');
    });
  });

  describe('findById', () => {
    it('should return the station when found', async () => {
      const station = { id: 1, siteId: 'SITE-001', endId: 'END-001' };
      repo.findOne.mockResolvedValue(station);

      await expect(service.findById(1)).resolves.toEqual(station);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing station', async () => {
      const station = { id: 1, siteId: 'SITE-001', endId: 'END-001', endereco: null };
      repo.findOne.mockResolvedValue(station);
      repo.save.mockResolvedValue({ ...station, endereco: 'Av. Nova, 10' });

      const result = await service.update(1, { endereco: 'Av. Nova, 10' });

      expect(result.endereco).toBe('Av. Nova, 10');
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });

    it('should throw NotFoundException when station does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update(99, { endereco: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing station', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when station does not exist', async () => {
      repo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
