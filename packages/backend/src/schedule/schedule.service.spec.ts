import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleEvent } from './schedule-event.entity';

describe('ScheduleService', () => {
  let service: ScheduleService;

  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const buildQueryBuilder = (data: ScheduleEvent[], total: number) => {
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
        ScheduleService,
        { provide: getRepositoryToken(ScheduleEvent), useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(ScheduleService);
  });

  describe('create', () => {
    it('should create an event with the default status when not provided', async () => {
      const created = { id: 1, title: 'Reunião', status: 'scheduled' } as ScheduleEvent;
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(created);

      const result = await service.create({ title: 'Reunião' });

      expect(repository.create).toHaveBeenCalledWith({ title: 'Reunião', status: 'scheduled' });
      expect(repository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('should create an event keeping the provided status', async () => {
      const created = { id: 2, title: 'Entrega', status: 'confirmed' } as ScheduleEvent;
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(created);

      const result = await service.create({ title: 'Entrega', status: 'confirmed' });

      expect(repository.create).toHaveBeenCalledWith({ title: 'Entrega', status: 'confirmed' });
      expect(result.status).toBe('confirmed');
    });
  });

  describe('findAll', () => {
    it('should return paginated events with default sort by startAt ascending', async () => {
      const event = { id: 1, title: 'Evento', startAt: '2026-08-03T10:00' } as ScheduleEvent;
      const qb = buildQueryBuilder([event], 1);
      repository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({});

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('ev');
      expect(qb.orderBy).toHaveBeenCalledWith('ev.startAt', 'ASC');
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({ data: [event], total: 1 });
    });

    it('should apply search, status and date range filters', async () => {
      const event = { id: 1, title: 'Manutenção' } as ScheduleEvent;
      const qb = buildQueryBuilder([event], 1);
      repository.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({
        search: 'manu',
        status: 'scheduled',
        from: '2026-08-01',
        to: '2026-08-31',
      });

      expect(qb.where).toHaveBeenCalledWith(
        'ev.title LIKE :search OR ev.client LIKE :search OR ev.location LIKE :search OR ev.assignedTo LIKE :search',
        { search: '%manu%' },
      );
      expect(qb.andWhere).toHaveBeenCalledWith('ev.status = :status', { status: 'scheduled' });
      expect(qb.andWhere).toHaveBeenCalledWith('ev.startAt >= :from', { from: '2026-08-01' });
      expect(qb.andWhere).toHaveBeenCalledWith('ev.startAt <= :to', { to: '2026-08-31' });
    });

    it('should fall back to startAt when sortBy is not allowed', async () => {
      const qb = buildQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ sortBy: 'notAllowed', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('ev.startAt', 'DESC');
    });

    it('should use the allowed sortBy and sortOrder when provided', async () => {
      const qb = buildQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ sortBy: 'title', sortOrder: 'DESC' });

      expect(qb.orderBy).toHaveBeenCalledWith('ev.title', 'DESC');
    });
  });

  describe('findById', () => {
    it('should return the event when found', async () => {
      const event = { id: 1, title: 'Evento' } as ScheduleEvent;
      repository.findOne.mockResolvedValue(event);

      const result = await service.findById(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(event);
    });

    it('should throw NotFoundException when the event does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should merge the dto into the existing event and save it', async () => {
      const event = { id: 1, title: 'Antigo', status: 'scheduled' } as ScheduleEvent;
      repository.findOne.mockResolvedValue(event);
      repository.save.mockImplementation(async (e: ScheduleEvent) => e);

      const result = await service.update(1, { title: 'Novo' });

      expect(event.title).toBe('Novo');
      expect(repository.save).toHaveBeenCalledWith(event);
      expect(result.title).toBe('Novo');
    });

    it('should throw NotFoundException when the event does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(1, { title: 'Novo' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete the event when found', async () => {
      repository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete(1)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when nothing was deleted', async () => {
      repository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });
});
