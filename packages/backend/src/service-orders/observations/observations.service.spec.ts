import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ServiceOrderObservationsService } from './observations.service';
import { ServiceOrderObservation } from './domain/observation.entity';
import { OBSERVATION_REPOSITORY } from './domain/observation.repository';
import { ObservationFileStorage } from './infrastructure/observation-file-storage';

describe('ServiceOrderObservationsService', () => {
  let service: ServiceOrderObservationsService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    saveMany: jest.fn(),
    findById: jest.fn(),
    findByServiceOrder: jest.fn(),
    findMaxPosition: jest.fn(),
    delete: jest.fn(),
  };

  const fileStorage = {
    getFilePath: jest.fn((o) => `/uploads/${o.serviceOrderId}/${o.filename}`),
    store: jest.fn(),
    remove: jest.fn(),
  };

  const file = { originalname: 'anexo.pdf', mimetype: 'application/pdf', size: 123, buffer: Buffer.from('x') } as Express.Multer.File;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ServiceOrderObservationsService,
        { provide: OBSERVATION_REPOSITORY, useValue: repo },
        { provide: ObservationFileStorage, useValue: fileStorage },
      ],
    }).compile();

    service = moduleRef.get(ServiceOrderObservationsService);
  });

  describe('create', () => {
    it('should create an observation at the next position', async () => {
      repo.findMaxPosition.mockResolvedValue(3);
      repo.create.mockResolvedValue(
        new ServiceOrderObservation({ id: 1, serviceOrderId: 1, title: 'Título', position: 4 }),
      );

      const result = await service.create(1, { title: 'Título' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ serviceOrderId: 1, title: 'Título', position: 4 }),
      );
      expect(result.position).toBe(4);
    });

    it('should store the file when provided', async () => {
      repo.findMaxPosition.mockResolvedValue(0);
      fileStorage.store.mockReturnValue({
        filename: 'uuid.pdf',
        originalName: 'anexo.pdf',
        mimetype: 'application/pdf',
        size: 123,
      });
      repo.create.mockImplementation(async (o) => o);

      const result = await service.create(1, { title: 'Título' }, file);

      expect(fileStorage.store).toHaveBeenCalledWith(1, file);
      expect(result.filename).toBe('uuid.pdf');
      expect(result.originalName).toBe('anexo.pdf');
    });

    it('should reject an observation without a title', async () => {
      await expect(service.create(1, { title: '   ' })).rejects.toThrow(BadRequestException);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('findByServiceOrder', () => {
    it('should delegate to the repository', async () => {
      const rows = [new ServiceOrderObservation({ id: 1, serviceOrderId: 1, title: 'A' })];
      repo.findByServiceOrder.mockResolvedValue(rows);

      await expect(service.findByServiceOrder(1)).resolves.toEqual(rows);
      expect(repo.findByServiceOrder).toHaveBeenCalledWith(1);
    });
  });

  describe('reorder', () => {
    it('should save the observations when the order changes', async () => {
      repo.findByServiceOrder.mockResolvedValue([
        new ServiceOrderObservation({ id: 1, serviceOrderId: 1, title: 'A', position: 0 }),
        new ServiceOrderObservation({ id: 2, serviceOrderId: 1, title: 'B', position: 1 }),
      ]);

      await service.reorder(1, [2, 1]);

      expect(repo.saveMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, position: 1 }),
          expect.objectContaining({ id: 2, position: 0 }),
        ]),
      );
    });

    it('should not save when the order is unchanged', async () => {
      repo.findByServiceOrder.mockResolvedValue([
        new ServiceOrderObservation({ id: 1, serviceOrderId: 1, title: 'A', position: 0 }),
      ]);

      await service.reorder(1, [1]);

      expect(repo.saveMany).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update title and description', async () => {
      const observation = new ServiceOrderObservation({ id: 1, serviceOrderId: 1, title: 'Antigo' });
      repo.findById.mockResolvedValue(observation);
      repo.save.mockImplementation(async (o) => o);

      const result = await service.update(1, { title: 'Novo', description: 'Desc' });

      expect(result.title).toBe('Novo');
      expect(result.description).toBe('Desc');
    });

    it('should replace the file when provided', async () => {
      const observation = new ServiceOrderObservation({
        id: 1,
        serviceOrderId: 1,
        title: 'Antigo',
        filename: 'old.pdf',
      });
      repo.findById.mockResolvedValue(observation);
      fileStorage.store.mockReturnValue({
        filename: 'new.pdf',
        originalName: 'novo.pdf',
        mimetype: 'application/pdf',
        size: 5,
      });
      repo.save.mockImplementation(async (o) => o);

      const result = await service.update(1, {}, file);

      expect(fileStorage.remove).toHaveBeenCalledWith(observation);
      expect(result.filename).toBe('new.pdf');
    });

    it('should reject an empty title on update', async () => {
      repo.findById.mockResolvedValue(new ServiceOrderObservation({ id: 1, serviceOrderId: 1, title: 'A' }));

      await expect(service.update(1, { title: '' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return the observation when found', async () => {
      const observation = new ServiceOrderObservation({ id: 1, serviceOrderId: 1, title: 'A' });
      repo.findById.mockResolvedValue(observation);

      await expect(service.findById(1)).resolves.toEqual(observation);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should remove the file and the record', async () => {
      const observation = new ServiceOrderObservation({ id: 1, serviceOrderId: 1, title: 'A', filename: 'a.pdf' });
      repo.findById.mockResolvedValue(observation);

      await service.delete(1);

      expect(fileStorage.remove).toHaveBeenCalledWith(observation);
      expect(repo.delete).toHaveBeenCalledWith(1);
    });
  });
});
