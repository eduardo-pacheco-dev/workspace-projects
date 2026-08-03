import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collaborator } from '../collaborators/collaborator.entity';
import { CreateFreelancerDto } from './dto/create-freelancer.dto';
import { UpdateFreelancerDto } from './dto/update-freelancer.dto';

@Injectable()
export class FreelancersService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorsRepository: Repository<Collaborator>,
  ) {}

  async create(dto: CreateFreelancerDto): Promise<Collaborator> {
    const freelancer = this.collaboratorsRepository.create({
      ...dto,
      isFreelancer: true,
      skills: dto.skills ?? '[]',
      portfolio: dto.portfolio ?? '[]',
      experienceLevel: dto.experienceLevel ?? 'junior',
      availability: dto.availability ?? 'available',
      status: dto.status ?? 'ativo',
    });
    const saved = await this.collaboratorsRepository.save(freelancer);
    if (!saved.codigo) {
      saved.codigo = `FR-${String(saved.id).padStart(4, '0')}`;
      return this.collaboratorsRepository.save(saved);
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
  }): Promise<{ data: Collaborator[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      experienceLevel,
      availability,
    } = query;

    const qb = this.collaboratorsRepository.createQueryBuilder('f');
    qb.where('f.isFreelancer = 1');

    if (search) {
      qb.andWhere('f.firstName LIKE :search OR f.lastName LIKE :search OR f.skills LIKE :search', { search: `%${search}%` });
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

  async findById(id: number): Promise<Collaborator> {
    const freelancer = await this.collaboratorsRepository.findOne({
      where: { id, isFreelancer: true },
    });
    if (!freelancer) throw new NotFoundException('Freelancer not found');
    return freelancer;
  }

  async findByUserId(userId: number): Promise<Collaborator | null> {
    return this.collaboratorsRepository.findOne({
      where: { userId, isFreelancer: true },
    });
  }

  async update(id: number, dto: UpdateFreelancerDto): Promise<Collaborator> {
    const freelancer = await this.findById(id);
    Object.assign(freelancer, dto);
    return this.collaboratorsRepository.save(freelancer);
  }

  async delete(id: number): Promise<void> {
    const freelancer = await this.findById(id);
    const result = await this.collaboratorsRepository.delete(freelancer.id);
    if (result.affected === 0) throw new NotFoundException('Freelancer not found');
  }

  async updatePhoto(id: number, url: string): Promise<Collaborator> {
    const freelancer = await this.findById(id);
    freelancer.foto = url;
    return this.collaboratorsRepository.save(freelancer);
  }

  async updateDocument(id: number, tipo: string, url: string): Promise<Collaborator> {
    const freelancer = await this.findById(id);
    if (tipo === 'rg') {
      freelancer.rgArquivo = url;
    } else if (tipo === 'carteira') {
      freelancer.carteiraArquivo = url;
    } else if (tipo === 'habilitacao') {
      freelancer.habilitacaoArquivo = url;
    } else {
      throw new NotFoundException('Tipo de documento inválido');
    }
    return this.collaboratorsRepository.save(freelancer);
  }
}
