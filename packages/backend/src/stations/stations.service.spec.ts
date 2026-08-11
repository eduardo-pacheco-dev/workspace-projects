import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StationsService } from './stations.service';
import { Station } from './domain/station.entity';
import { STATION_REPOSITORY } from './domain/station.repository';

describe('StationsService', () => {
  let service: StationsService;

  const repo = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findExistingRefs: jest.fn(),
    insertMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        StationsService,
        { provide: STATION_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(StationsService);
  });

  describe('create', () => {
    it('should create a station with ativo default', async () => {
      const saved = new Station({ id: 1, siteId: 'SITE-001', endId: 'END-001', status: 'ativo' });
      repo.create.mockResolvedValue(saved);

      const result = await service.create({ siteId: 'SITE-001', endId: 'END-001' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ siteId: 'SITE-001', endId: 'END-001' }),
      );
      expect(result.status).toBe('ativo');
    });

    it('should keep endId for TIM stations', async () => {
      const saved = new Station({ id: 1, siteId: 'SITE-T', endId: 'END-T', operadora: 'TIM' });
      repo.create.mockResolvedValue(saved);

      await service.create({ siteId: 'SITE-T', endId: 'END-T', operadora: 'TIM' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ siteId: 'SITE-T', endId: 'END-T', operadora: 'TIM' }),
      );
    });

    it('should clear endId when operadora is not TIM', async () => {
      const saved = new Station({ id: 1, siteId: 'SITE-C', endId: '', operadora: 'CLARO' });
      repo.create.mockResolvedValue(saved);

      const result = await service.create({ siteId: 'SITE-C', endId: 'END-C', operadora: 'CLARO' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ siteId: 'SITE-C', endId: '', operadora: 'CLARO' }),
      );
      expect(result.endId).toBe('');
    });

    it('should allow creating a non-TIM station without endId', async () => {
      const saved = new Station({ id: 1, siteId: 'SITE-V', endId: '', operadora: 'VIVO' });
      repo.create.mockResolvedValue(saved);

      await service.create({ siteId: 'SITE-V', operadora: 'VIVO' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ siteId: 'SITE-V', endId: '', operadora: 'VIVO' }),
      );
    });
  });

  describe('importStations', () => {
    it('should insert new stations and update existing ones', async () => {
      repo.findExistingRefs.mockResolvedValue([{ id: 1, siteId: 'SITE-001', endId: 'END-001' }]);
      repo.insertMany.mockResolvedValue(undefined);
      repo.update.mockResolvedValue(undefined);

      const result = await service.importStations([
        { siteId: 'SITE-001', endId: 'END-001', operadora: 'TIM', status: 'inativo' },
        { siteId: 'SITE-002', endId: 'END-002', operadora: 'TIM' },
      ]);

      expect(result).toEqual({ imported: 1, updated: 1, skipped: 0, errors: [] });
      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: 'inativo', operadora: 'TIM' }),
      );
      expect(repo.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({ siteId: 'SITE-002', endId: 'END-002', operadora: 'TIM', status: 'ativo' }),
      ]);
    });

    it('should skip rows without siteId or endId and report errors', async () => {
      repo.findExistingRefs.mockResolvedValue([]);

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
      expect(repo.findExistingRefs).not.toHaveBeenCalled();
      expect(repo.insertMany).not.toHaveBeenCalled();
    });

    it('should insert only once when the same key repeats within the file', async () => {
      repo.findExistingRefs.mockResolvedValue([]);

      const result = await service.importStations([
        { siteId: 'SITE-010', operadora: 'VIVO', endereco: 'A' },
        { siteId: 'SITE-010', operadora: 'VIVO', endereco: 'B' },
      ]);

      expect(result.imported).toBe(1);
      expect(repo.insertMany).toHaveBeenCalledTimes(1);
      expect(repo.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({ siteId: 'SITE-010', endId: '' }),
      ]);
    });

    it('should default status to ativo and parse coordinates', async () => {
      repo.findExistingRefs.mockResolvedValue([]);

      const result = await service.importStations([
        { siteId: 'SITE-020', endId: 'END-020', latitude: '-23.55', longitude: '-46.63' },
      ]);

      expect(result.imported).toBe(1);
      expect(repo.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({ status: 'ativo', latitude: -23.55, longitude: -46.63 }),
      ]);
    });

    it('should ignore invalid coordinates', async () => {
      repo.findExistingRefs.mockResolvedValue([]);

      await service.importStations([
        { siteId: 'SITE-030', endId: 'END-030', latitude: 'abc', longitude: '' },
      ]);

      expect(repo.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({ latitude: undefined, longitude: undefined }),
      ]);
    });

    it('should not call the database when all rows are invalid', async () => {
      const result = await service.importStations([{ siteId: '  ' }]);

      expect(result.skipped).toBe(1);
      expect(repo.findExistingRefs).not.toHaveBeenCalled();
      expect(repo.insertMany).not.toHaveBeenCalled();
    });

    it('should clear endId for non-TIM rows', async () => {
      repo.findExistingRefs.mockResolvedValue([]);

      const result = await service.importStations([
        { siteId: 'SITE-600', endId: 'END-600', operadora: 'CLARO' },
      ]);

      expect(result.imported).toBe(1);
      expect(repo.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({ siteId: 'SITE-600', endId: '', operadora: 'CLARO' }),
      ]);
    });

    it('should not require endId for non-TIM rows', async () => {
      repo.findExistingRefs.mockResolvedValue([]);

      const result = await service.importStations([
        { siteId: 'SITE-601', operadora: 'VIVO' },
      ]);

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(0);
      expect(repo.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({ siteId: 'SITE-601', endId: '', operadora: 'VIVO' }),
      ]);
    });

    it('should still require endId for TIM rows', async () => {
      repo.findExistingRefs.mockResolvedValue([]);

      const result = await service.importStations([
        { siteId: 'SITE-602', operadora: 'TIM' },
      ]);

      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.errors).toEqual(['Linha 1: Site ID e End ID são obrigatórios.']);
    });
  });

  describe('findAll', () => {
    it('should delegate to the repository with the query', async () => {
      const data = [new Station({ id: 1, siteId: 'SITE-001' })];
      repo.findAll.mockResolvedValue({ data, total: 1 });

      const query = {
        page: 1,
        limit: 10,
        search: 'site',
        status: 'inativo',
        operadora: 'TIM',
        sortBy: 'siteId',
        sortOrder: 'DESC' as const,
      };
      const result = await service.findAll(query);

      expect(repo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data, total: 1 });
    });
  });

  describe('findById', () => {
    it('should return the station when found', async () => {
      const station = new Station({ id: 1, siteId: 'SITE-001', endId: 'END-001' });
      repo.findById.mockResolvedValue(station);

      await expect(service.findById(1)).resolves.toEqual(station);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing station', async () => {
      const station = new Station({ id: 1, siteId: 'SITE-001', endId: 'END-001', endereco: null });
      repo.findById.mockResolvedValue(station);
      repo.update.mockResolvedValue(undefined);

      const result = await service.update(1, { endereco: 'Av. Nova, 10' });

      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ id: 1, endereco: 'Av. Nova, 10' }),
      );
      expect(result.endereco).toBe('Av. Nova, 10');
    });

    it('should throw NotFoundException when station does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update(99, { endereco: 'X' })).rejects.toThrow(NotFoundException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should clear endId when operator changes to a non-TIM operator', async () => {
      const station = new Station({ id: 1, siteId: 'SITE-001', endId: 'END-001', operadora: 'TIM' });
      repo.findById.mockResolvedValue(station);
      repo.update.mockResolvedValue(undefined);

      const result = await service.update(1, { operadora: 'CLARO' });

      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ endId: '', operadora: 'CLARO' }),
      );
      expect(result.endId).toBe('');
    });
  });

  describe('delete', () => {
    it('should delete an existing station', async () => {
      repo.delete.mockResolvedValue(true);

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when station does not exist', async () => {
      repo.delete.mockResolvedValue(false);

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
