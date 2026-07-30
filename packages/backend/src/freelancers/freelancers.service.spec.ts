import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreelancersService } from './freelancers.service';
import { Freelancer } from './freelancer.entity';
import { NotFoundException } from '@nestjs/common';

const mockFreelancer: Freelancer = {
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
  lpus: [],
  attachments: [],
  comments: [],
};

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockFreelancer], 1]),
};

describe('FreelancersService', () => {
  let service: FreelancersService;
  let repo: Repository<Freelancer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FreelancersService,
        {
          provide: getRepositoryToken(Freelancer),
          useValue: {
            create: jest.fn().mockReturnValue(mockFreelancer),
            save: jest.fn().mockResolvedValue(mockFreelancer),
            findOne: jest.fn().mockResolvedValue(mockFreelancer),
            delete: jest.fn().mockResolvedValue({ affected: 1, raw: {} }),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<FreelancersService>(FreelancersService);
    repo = module.get<Repository<Freelancer>>(getRepositoryToken(Freelancer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a freelancer with defaults for missing fields', async () => {
      const dto = { firstName: 'João', lastName: 'Silva' } as any;
      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith({
        firstName: 'João',
        lastName: 'Silva',
        skills: '[]',
        portfolio: '[]',
        experienceLevel: 'junior',
        availability: 'available',
      });
      expect(repo.save).toHaveBeenCalledWith(mockFreelancer);
      expect(result).toEqual(mockFreelancer);
    });

    it('should create a freelancer with provided values', async () => {
      const dto = {
        firstName: 'Maria',
        lastName: 'Santos',
        skills: 'Python,Django',
        portfolio: 'https://maria.dev',
        experienceLevel: 'senior',
        availability: 'busy',
      };
      const maria = { ...mockFreelancer, firstName: 'Maria', lastName: 'Santos' };
      jest.spyOn(repo, 'create').mockReturnValue(maria);
      jest.spyOn(repo, 'save').mockResolvedValue(maria);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith({
        firstName: 'Maria',
        lastName: 'Santos',
        skills: 'Python,Django',
        portfolio: 'https://maria.dev',
        experienceLevel: 'senior',
        availability: 'busy',
      });
      expect(result.firstName).toBe('Maria');
    });
  });

  describe('findAll', () => {
    it('should return paginated results with defaults', async () => {
      const result = await service.findAll({});

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('f.id', 'ASC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({ data: [mockFreelancer], total: 1 });
    });

    it('should apply search filter', async () => {
      await service.findAll({ search: 'João' });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'f.firstName LIKE :search OR f.lastName LIKE :search OR f.skills LIKE :search',
        { search: '%João%' },
      );
    });

    it('should apply experienceLevel filter', async () => {
      await service.findAll({ experienceLevel: 'senior' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'f.experienceLevel = :experienceLevel',
        { experienceLevel: 'senior' },
      );
    });

    it('should apply availability filter', async () => {
      await service.findAll({ availability: 'available' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'f.availability = :availability',
        { availability: 'available' },
      );
    });

    it('should sort by allowed fields and fallback to id', async () => {
      await service.findAll({ sortBy: 'invalid', sortOrder: 'DESC' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('f.id', 'DESC');
    });

    it('should paginate correctly', async () => {
      await service.findAll({ page: 2, limit: 5 });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });
  });

  describe('findById', () => {
    it('should return a freelancer when found', async () => {
      const result = await service.findById(1);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockFreelancer);
    });

    it('should throw NotFoundException when not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return a freelancer when found', async () => {
      const result = await service.findByUserId(1);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual(mockFreelancer);
    });

    it('should return null when not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      const result = await service.findByUserId(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the freelancer', async () => {
      const dto = { firstName: 'João Updated' };
      const updated = { ...mockFreelancer, firstName: 'João Updated' };
      jest.spyOn(repo, 'save').mockResolvedValue(updated);

      const result = await service.update(1, dto);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repo.save).toHaveBeenCalled();
      expect(result.firstName).toBe('João Updated');
    });

    it('should throw NotFoundException when freelancer not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a freelancer', async () => {
      const result = await service.delete(1);
      expect(repo.delete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when not found', async () => {
      jest.spyOn(repo, 'delete').mockResolvedValue({ affected: 0, raw: {} });
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
