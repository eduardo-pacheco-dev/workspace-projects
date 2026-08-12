import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { RadioLinksService } from './radio-links.service';
import { RadioLink } from './radio-link.entity';
import { StationEntity } from '../stations/infrastructure/station.entity';

describe('RadioLinksService', () => {
  let service: RadioLinksService;

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

  const stationRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const buildQueryBuilder = (data: RadioLink[], total: number) => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
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
        RadioLinksService,
        { provide: getRepositoryToken(RadioLink), useValue: repo },
        { provide: getRepositoryToken(StationEntity), useValue: stationRepo },
      ],
    }).compile();

    service = moduleRef.get(RadioLinksService);
  });

  describe('create', () => {
    it('should create a radio link', async () => {
      const saved = { id: 1, nome: 'ENLACE-1', status: 'ativo' };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);
      stationRepo.findOne.mockResolvedValue(null);

      const result = await service.create({ nome: 'ENLACE-1' });

      expect(repo.create).toHaveBeenCalledWith({ nome: 'ENLACE-1' });
      expect(result.status).toBe('ativo');
    });

    it('should fill station A snapshot when stationAId resolves', async () => {
      const saved = { id: 1, nome: 'ENLACE-1' } as RadioLink;
      repo.create.mockReturnValue(saved);
      repo.save.mockImplementation(async (r) => r);
      stationRepo.findOne.mockResolvedValue({ id: 10, siteId: 'SITE-A', endId: 'END-A' });

      await service.create({ nome: 'ENLACE-1', stationAId: 10 });

      expect(saved.siteIdA).toBe('SITE-A');
      expect(saved.stationAId).toBe(10);
    });
  });

  describe('importRadioLinks', () => {
    it('should insert new radio links and update existing ones by nome', async () => {
      stationRepo.find.mockResolvedValue([]);
      repo.find.mockResolvedValue([{ id: 1, nome: 'ENLACE-EXISTE' }]);
      repo.insert.mockResolvedValue({});
      repo.update.mockResolvedValue({});

      const result = await service.importRadioLinks([
        { nome: 'ENLACE-EXISTE', status: 'inativo' },
        { nome: 'ENLACE-NOVO', frequencia: '23 GHz' },
      ]);

      expect(result).toEqual({ imported: 1, updated: 1, skipped: 0, errors: [] });
      expect(repo.update).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'inativo' }));
      expect(repo.insert).toHaveBeenCalledWith([
        expect.objectContaining({ nome: 'ENLACE-NOVO', frequencia: '23 GHz', status: 'ativo' }),
      ]);
    });

    it('should skip rows without nome and report errors', async () => {
      const result = await service.importRadioLinks([{ nome: '' }, { nome: '   ' }]);

      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(2);
      expect(result.errors).toEqual([
        'Linha 1: Nome é obrigatório.',
        'Linha 2: Nome é obrigatório.',
      ]);
      expect(stationRepo.find).not.toHaveBeenCalled();
      expect(repo.find).not.toHaveBeenCalled();
    });

    it('should resolve station A and B by siteId and fill snapshots', async () => {
      stationRepo.find.mockResolvedValue([
        { id: 1, siteId: 'SITE-A', endId: 'END-A', address: 'Av A', latitude: -10, longitude: -20, mobileCarrier: 'TIM' },
        { id: 2, siteId: 'SITE-B', endId: 'END-B', address: 'Av B', latitude: -11, longitude: -21, mobileCarrier: 'CLARO' },
      ]);
      repo.find.mockResolvedValue([]);
      repo.insert.mockImplementation(async (rows) => rows);

      const result = await service.importRadioLinks([
        { nome: 'ENLACE-AB', siteIdA: 'SITE-A', endIdA: 'END-A', operadoraA: 'TIM', siteIdB: 'SITE-B', operadoraB: 'CLARO' },
      ]);

      expect(result.imported).toBe(1);
      const inserted = repo.insert.mock.calls[0][0][0];
      expect(inserted.stationAId).toBe(1);
      expect(inserted.siteIdA).toBe('SITE-A');
      expect(inserted.enderecoA).toBe('Av A');
      expect(inserted.stationBId).toBe(2);
      expect(inserted.operadoraB).toBe('CLARO');
    });

    it('should keep row snapshot data when the station is not found', async () => {
      stationRepo.find.mockResolvedValue([]);
      repo.find.mockResolvedValue([]);
      repo.insert.mockImplementation(async (rows) => rows);

      const result = await service.importRadioLinks([
        { nome: 'ENLACE-X', siteIdA: 'SITE-NAO-EXISTE', endIdA: 'END-X', operadoraA: 'TIM' },
      ]);

      expect(result.imported).toBe(1);
      const inserted = repo.insert.mock.calls[0][0][0];
      expect(inserted.stationAId).toBeUndefined();
      expect(inserted.siteIdA).toBe('SITE-NAO-EXISTE');
      expect(inserted.endIdA).toBe('END-X');
    });

    it('should insert only once when the same nome repeats within the file', async () => {
      stationRepo.find.mockResolvedValue([]);
      repo.find.mockResolvedValue([]);

      const result = await service.importRadioLinks([
        { nome: 'ENLACE-REP', frequencia: 'A' },
        { nome: 'ENLACE-REP', frequencia: 'B' },
      ]);

      expect(result.imported).toBe(1);
      expect(repo.insert).toHaveBeenCalledTimes(1);
    });

    it('should parse coordinates and default status', async () => {
      stationRepo.find.mockResolvedValue([]);
      repo.find.mockResolvedValue([]);
      repo.insert.mockImplementation(async (rows) => rows);

      await service.importRadioLinks([
        { nome: 'ENLACE-C', latitudeA: '-23.55', longitudeB: '-46.63' },
      ]);

      const inserted = repo.insert.mock.calls[0][0][0];
      expect(inserted.latitudeA).toBe(-23.55);
      expect(inserted.longitudeB).toBe(-46.63);
      expect(inserted.status).toBe('ativo');
    });
  });

  describe('findAll', () => {
    it('should list radio links with default sort', async () => {
      const data = [{ id: 1, nome: 'ENLACE-1' }];
      const qb = buildQueryBuilder(data as RadioLink[], 1);
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('rl');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledTimes(2);
      expect(qb.orderBy).toHaveBeenCalledWith('rl.id', 'ASC');
      expect(result).toEqual({ data, total: 1 });
    });

    it('should apply search, status and operadora filters', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ search: 'ENLACE', status: 'ativo', operadora: 'TIM' });

      expect(qb.where).toHaveBeenCalledWith(
        expect.stringContaining('rl.nome LIKE :search'),
        { search: '%ENLACE%' },
      );
      expect(qb.andWhere).toHaveBeenCalledWith('rl.status = :status', { status: 'ativo' });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'rl.operadoraA = :operadora OR rl.operadoraB = :operadora',
        { operadora: 'TIM' },
      );
    });

    it('should ignore unsupported sort columns', async () => {
      const qb = buildQueryBuilder([], 0);
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ sortBy: 'DROP TABLE', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('rl.id', 'DESC');
    });
  });

  describe('findById', () => {
    it('should return the radio link when found', async () => {
      const radioLink = { id: 1, nome: 'ENLACE-1' };
      repo.findOne.mockResolvedValue(radioLink);

      await expect(service.findById(1)).resolves.toEqual(radioLink);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['stationA', 'stationB'] });
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing radio link', async () => {
      const radioLink = { id: 1, nome: 'ENLACE-1', frequencia: '23 GHz' };
      repo.findOne.mockResolvedValue(radioLink);
      repo.save.mockImplementation(async (r) => r);

      const result = await service.update(1, { capacidade: '1 Gbps' });

      expect(result.capacidade).toBe('1 Gbps');
    });

    it('should throw NotFoundException when radio link does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update(99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing radio link', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when radio link does not exist', async () => {
      repo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
