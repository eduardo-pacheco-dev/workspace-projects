import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { ServiceOrder } from './domain/service-order.entity';
import { SERVICE_ORDER_REPOSITORY } from './domain/service-order.repository';

describe('ServiceOrdersService', () => {
  let service: ServiceOrdersService;

  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ServiceOrdersService,
        { provide: SERVICE_ORDER_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(ServiceOrdersService);
  });

  describe('create', () => {
    it('should create an order with the generated numero', async () => {
      repo.create.mockResolvedValueOnce(new ServiceOrder({ id: 1, cliente: 'Vivo', numero: '' }));
      repo.save.mockResolvedValueOnce(new ServiceOrder({ id: 1, cliente: 'Vivo', numero: 'OS-001' }));

      const result = await service.create({ cliente: 'Vivo' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ cliente: 'Vivo', numero: '', status: 'aberta' }),
      );
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ numero: 'OS-001' }));
      expect(result.numero).toBe('OS-001');
    });
  });

  describe('findAll', () => {
    it('should delegate to the repository', async () => {
      const data = [new ServiceOrder({ id: 1, cliente: 'Vivo' })];
      repo.findAll.mockResolvedValue({ data, total: 1 });

      const query = { page: 1, limit: 10, search: 'vivo', status: 'aberta' };
      const result = await service.findAll(query);

      expect(repo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data, total: 1 });
    });
  });

  describe('findById', () => {
    it('should return the order when found', async () => {
      const order = new ServiceOrder({ id: 1, cliente: 'Vivo' });
      repo.findById.mockResolvedValue(order);

      await expect(service.findById(1)).resolves.toEqual(order);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing order', async () => {
      const order = new ServiceOrder({ id: 1, cliente: 'Vivo', status: 'aberta' });
      repo.findById.mockResolvedValue(order);
      repo.save.mockImplementation(async (o) => o);

      const result = await service.update(1, { status: 'concluida' });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'concluida' }));
      expect(result.status).toBe('concluida');
    });

    it('should throw NotFoundException when order does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update(99, { cliente: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an existing order', async () => {
      repo.delete.mockResolvedValue(true);

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when order does not exist', async () => {
      repo.delete.mockResolvedValue(false);

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
