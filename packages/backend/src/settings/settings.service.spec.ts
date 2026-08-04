import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SystemSetting } from './settings.entity';

describe('SettingsService', () => {
  let service: SettingsService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: getRepositoryToken(SystemSetting), useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(SettingsService);
  });

  describe('findAll', () => {
    it('should map rows to a record keyed by setting key', async () => {
      repo.find.mockResolvedValue([
        { id: 1, key: 'companyName', value: 'EA Projetos Telecom' },
        { id: 2, key: 'currency', value: 'BRL' },
      ]);

      const result = await service.findAll();

      expect(result).toEqual({
        companyName: 'EA Projetos Telecom',
        currency: 'BRL',
      });
    });

    it('should return empty object when no settings exist', async () => {
      repo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual({});
    });

    it('should normalize null values to empty string', async () => {
      repo.find.mockResolvedValue([{ id: 1, key: 'companyPhone', value: null }]);
      const result = await service.findAll();
      expect(result).toEqual({ companyPhone: '' });
    });
  });

  describe('upsert', () => {
    it('should create missing settings and update existing ones', async () => {
      repo.findOne.mockResolvedValueOnce({ id: 1, key: 'companyName', value: 'Antiga' });
      repo.findOne.mockResolvedValueOnce(null);
      repo.find.mockResolvedValue([
        { id: 1, key: 'companyName', value: 'Nova Empresa' },
        { id: 2, key: 'currency', value: 'USD' },
      ]);

      const result = await service.upsert({ companyName: 'Nova Empresa', currency: 'USD' });

      expect(repo.save).toHaveBeenCalledTimes(2);
      expect(repo.create).toHaveBeenCalledWith({ key: 'currency', value: 'USD' });
      expect(result).toEqual({
        companyName: 'Nova Empresa',
        currency: 'USD',
      });
    });

    it('should ignore undefined values', async () => {
      repo.find.mockResolvedValue([]);
      const result = await service.upsert({ companyName: undefined, currency: 'BRL' });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({});
    });
  });
});
