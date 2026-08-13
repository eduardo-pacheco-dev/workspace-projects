import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RadioLinksService } from './radio-links.service';
import { RadioLink } from './domain/radio-link.entity';
import { RADIO_LINK_REPOSITORY } from './domain/radio-link.repository';

describe('RadioLinksService', () => {
  let service: RadioLinksService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
    findStationById: jest.fn(),
    findAllStations: jest.fn(),
    findExistingNames: jest.fn(),
    insertMany: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        RadioLinksService,
        { provide: RADIO_LINK_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(RadioLinksService);
  });

  describe('create', () => {
    it('should create a radio link', async () => {
      repo.create.mockResolvedValue(new RadioLink({ id: 1, nome: 'ENLACE-1', status: 'ativo' }));

      const result = await service.create({ nome: 'ENLACE-1' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'ENLACE-1', status: 'ativo' }),
      );
      expect(result.status).toBe('ativo');
    });

    it('should fill station A snapshot when stationAId resolves', async () => {
      repo.findStationById.mockResolvedValue({ id: 10, siteId: 'SITE-A', endId: 'END-A' });
      repo.create.mockImplementation(async (r) => r);

      await service.create({ nome: 'ENLACE-1', stationAId: 10 });

      expect(repo.findStationById).toHaveBeenCalledWith(10);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ siteIdA: 'SITE-A', stationAId: 10 }),
      );
    });
  });

  describe('importRadioLinks', () => {
    it('should insert new radio links and update existing ones by nome', async () => {
      repo.findAllStations.mockResolvedValue([]);
      repo.findExistingNames.mockResolvedValue([{ id: 1, nome: 'ENLACE-EXISTE' }]);
      repo.insertMany.mockResolvedValue(undefined);
      repo.update.mockResolvedValue(undefined);

      const result = await service.importRadioLinks([
        { nome: 'ENLACE-EXISTE', status: 'inativo' },
        { nome: 'ENLACE-NOVO', frequencia: '23 GHz' },
      ]);

      expect(result).toEqual({ imported: 1, updated: 1, skipped: 0, errors: [] });
      expect(repo.update).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'inativo' }));
      expect(repo.insertMany).toHaveBeenCalledWith([
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
      expect(repo.findAllStations).not.toHaveBeenCalled();
      expect(repo.findExistingNames).not.toHaveBeenCalled();
    });

    it('should resolve station A and B by siteId and fill snapshots', async () => {
      repo.findAllStations.mockResolvedValue([
        { id: 1, siteId: 'SITE-A', endId: 'END-A', address: 'Av A', latitude: -10, longitude: -20, mobileCarrier: 'TIM' },
        { id: 2, siteId: 'SITE-B', endId: 'END-B', address: 'Av B', latitude: -11, longitude: -21, mobileCarrier: 'CLARO' },
      ]);
      repo.findExistingNames.mockResolvedValue([]);
      repo.insertMany.mockImplementation(async (rows) => rows);

      const result = await service.importRadioLinks([
        { nome: 'ENLACE-AB', siteIdA: 'SITE-A', endIdA: 'END-A', operadoraA: 'TIM', siteIdB: 'SITE-B', operadoraB: 'CLARO' },
      ]);

      expect(result.imported).toBe(1);
      expect(repo.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({
          stationAId: 1,
          siteIdA: 'SITE-A',
          enderecoA: 'Av A',
          stationBId: 2,
          operadoraB: 'CLARO',
        }),
      ]);
    });

    it('should keep row snapshot data when the station is not found', async () => {
      repo.findAllStations.mockResolvedValue([]);
      repo.findExistingNames.mockResolvedValue([]);
      repo.insertMany.mockImplementation(async (rows) => rows);

      const result = await service.importRadioLinks([
        { nome: 'ENLACE-X', siteIdA: 'SITE-NAO-EXISTE', endIdA: 'END-X', operadoraA: 'TIM' },
      ]);

      expect(result.imported).toBe(1);
      const inserted = repo.insertMany.mock.calls[0][0][0];
      expect(inserted.stationAId).toBeUndefined();
      expect(inserted.siteIdA).toBe('SITE-NAO-EXISTE');
      expect(inserted.endIdA).toBe('END-X');
    });

    it('should insert only once when the same nome repeats within the file', async () => {
      repo.findAllStations.mockResolvedValue([]);
      repo.findExistingNames.mockResolvedValue([]);

      const result = await service.importRadioLinks([
        { nome: 'ENLACE-REP', frequencia: 'A' },
        { nome: 'ENLACE-REP', frequencia: 'B' },
      ]);

      expect(result.imported).toBe(1);
      expect(repo.insertMany).toHaveBeenCalledTimes(1);
    });

    it('should parse coordinates and default status', async () => {
      repo.findAllStations.mockResolvedValue([]);
      repo.findExistingNames.mockResolvedValue([]);
      repo.insertMany.mockImplementation(async (rows) => rows);

      await service.importRadioLinks([
        { nome: 'ENLACE-C', latitudeA: '-23.55', longitudeB: '-46.63' },
      ]);

      expect(repo.insertMany).toHaveBeenCalledWith([
        expect.objectContaining({ latitudeA: -23.55, longitudeB: -46.63, status: 'ativo' }),
      ]);
    });
  });

  describe('findAll', () => {
    it('should delegate to the repository', async () => {
      const data = [new RadioLink({ id: 1, nome: 'ENLACE-1' })];
      repo.findAll.mockResolvedValue({ data, total: 1 });

      const query = { page: 1, limit: 10, search: 'ENLACE', status: 'ativo', operadora: 'TIM' };
      const result = await service.findAll(query);

      expect(repo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data, total: 1 });
    });
  });

  describe('findById', () => {
    it('should return the radio link when found', async () => {
      const radioLink = new RadioLink({ id: 1, nome: 'ENLACE-1' });
      repo.findById.mockResolvedValue(radioLink);

      await expect(service.findById(1)).resolves.toEqual(radioLink);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing radio link', async () => {
      const radioLink = new RadioLink({ id: 1, nome: 'ENLACE-1', frequencia: '23 GHz' });
      repo.findById.mockResolvedValue(radioLink);
      repo.save.mockImplementation(async (r) => r);

      const result = await service.update(1, { capacidade: '1 Gbps' });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ capacidade: '1 Gbps' }));
      expect(result.capacidade).toBe('1 Gbps');
    });

    it('should throw NotFoundException when radio link does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update(99, { nome: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing radio link', async () => {
      repo.delete.mockResolvedValue(true);

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when radio link does not exist', async () => {
      repo.delete.mockResolvedValue(false);

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
