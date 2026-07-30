import { Test, TestingModule } from '@nestjs/testing';
import { FreelancersController } from './freelancers.controller';
import { FreelancersService } from './freelancers.service';

const mockFreelancer = {
  id: 1,
  userId: 1,
  firstName: 'João',
  lastName: 'Silva',
  email: 'joao@test.com',
  phone: '11999999999',
  bio: 'Dev',
  portfolio: 'https://portfolio.com',
  hourlyRate: 50,
  skills: 'Node,React',
  experienceLevel: 'senior',
  availability: 'available',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('FreelancersController', () => {
  let controller: FreelancersController;
  let service: FreelancersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreelancersController],
      providers: [
        {
          provide: FreelancersService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockFreelancer),
            findAll: jest.fn().mockResolvedValue({ data: [mockFreelancer], total: 1 }),
            findById: jest.fn().mockResolvedValue(mockFreelancer),
            update: jest.fn().mockResolvedValue(mockFreelancer),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<FreelancersController>(FreelancersController);
    service = module.get<FreelancersService>(FreelancersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with the dto', async () => {
      const dto = { firstName: 'João', lastName: 'Silva' };
      const result = await controller.create(dto as any);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockFreelancer);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with query params', async () => {
      const result = await controller.findAll(1, 10, 'id', 'ASC', undefined, undefined, undefined);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1, limit: 10, sortBy: 'id', sortOrder: 'ASC',
        search: undefined, experienceLevel: undefined, availability: undefined,
      });
      expect(result).toEqual({ data: [mockFreelancer], total: 1 });
    });

    it('should pass search and filters', async () => {
      await controller.findAll(1, 10, 'id', 'ASC', 'João', 'senior', 'available');
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1, limit: 10, sortBy: 'id', sortOrder: 'ASC',
        search: 'João', experienceLevel: 'senior', availability: 'available',
      });
    });
  });

  describe('findById', () => {
    it('should call service.findById with the id', async () => {
      const result = await controller.findById(1);
      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockFreelancer);
    });
  });

  describe('update', () => {
    it('should call service.update with id and dto', async () => {
      const dto = { firstName: 'Updated' };
      const result = await controller.update(1, dto as any);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockFreelancer);
    });
  });

  describe('delete', () => {
    it('should call service.delete with the id', async () => {
      const result = await controller.delete(1);
      expect(service.delete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
