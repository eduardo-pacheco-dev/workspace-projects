import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Freelancer } from './freelancer.entity';
import { CreateFreelancerDto } from './dto/create-freelancer.dto';
import { UpdateFreelancerDto } from './dto/update-freelancer.dto';

@Injectable()
export class FreelancersService {
  constructor(
    @InjectRepository(Freelancer)
    private readonly freelancersRepository: Repository<Freelancer>,
  ) {}

  async create(dto: CreateFreelancerDto): Promise<Freelancer> {
    const freelancer = this.freelancersRepository.create({
      ...dto,
      skills: dto.skills ?? '[]',
      portfolio: dto.portfolio ?? '[]',
      experienceLevel: dto.experienceLevel ?? 'junior',
      availability: dto.availability ?? 'available',
      status: dto.status ?? 'ativo',
    });
    const saved = await this.freelancersRepository.save(freelancer);
    if (!saved.codigo) {
      saved.codigo = `FR-${String(saved.id).padStart(4, '0')}`;
      return this.freelancersRepository.save(saved);
    }
    return saved;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    experienceLevel?: string;
    availability?: string;
  }): Promise<{ data: Freelancer[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      experienceLevel,
      availability,
    } = query;

    const qb = this.freelancersRepository.createQueryBuilder('f');

    if (search) {
      qb.where('f.firstName LIKE :search OR f.lastName LIKE :search OR f.skills LIKE :search', { search: `%${search}%` });
    }

    if (experienceLevel) {
      qb.andWhere('f.experienceLevel = :experienceLevel', { experienceLevel });
    }

    if (availability) {
      qb.andWhere('f.availability = :availability', { availability });
    }

    const allowedSort = ['id', 'firstName', 'lastName', 'hourlyRate', 'experienceLevel', 'availability'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`f.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<Freelancer> {
    const freelancer = await this.freelancersRepository.findOne({ where: { id } });
    if (!freelancer) throw new NotFoundException('Freelancer not found');
    return freelancer;
  }

  async findByUserId(userId: number): Promise<Freelancer | null> {
    return this.freelancersRepository.findOne({ where: { userId } });
  }

  async update(id: number, dto: UpdateFreelancerDto): Promise<Freelancer> {
    const freelancer = await this.findById(id);
    Object.assign(freelancer, dto);
    return this.freelancersRepository.save(freelancer);
  }

  async delete(id: number): Promise<void> {
    const result = await this.freelancersRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Freelancer not found');
  }

  async updatePhoto(id: number, url: string): Promise<Freelancer> {
    const freelancer = await this.findById(id);
    freelancer.foto = url;
    return this.freelancersRepository.save(freelancer);
  }
}
