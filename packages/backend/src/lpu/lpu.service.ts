import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lpu } from './lpu.entity';
import { CreateLpuDto } from './dto/create-lpu.dto';
import { UpdateLpuDto } from './dto/update-lpu.dto';

@Injectable()
export class LpuService {
  constructor(
    @InjectRepository(Lpu)
    private readonly lpuRepository: Repository<Lpu>,
  ) {}

  async create(dto: CreateLpuDto): Promise<Lpu> {
    const lpu = this.lpuRepository.create(dto);
    return this.lpuRepository.save(lpu);
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      search?: string;
      status?: string;
      freelancerId?: number;
    },
    companyId?: number,
  ): Promise<{ data: Lpu[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'nome',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
      freelancerId,
    } = query;

    const qb = this.lpuRepository
      .createQueryBuilder('lpu')
      .leftJoinAndSelect('lpu.freelancer', 'freelancer');

    if (companyId !== undefined) {
      qb.andWhere('freelancer.companyId = :companyId', { companyId });
    }
    if (freelancerId !== undefined) {
      qb.andWhere('lpu.freelancerId = :freelancerId', { freelancerId });
    }
    if (status) {
      qb.andWhere('lpu.status = :status', { status });
    }
    if (search) {
      qb.andWhere('(lpu.nome LIKE :search OR lpu.descricao LIKE :search)', {
        search: `%${search}%`,
      });
    }

    const allowedSort = ['id', 'nome', 'valor', 'data', 'status', 'createdAt', 'freelancer'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'nome';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';
    const sortField = safeSort === 'freelancer' ? 'freelancer.nome' : `lpu.${safeSort}`;

    const [data, total] = await qb
      .orderBy(sortField, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findAllByFreelancer(freelancerId: number): Promise<Lpu[]> {
    return this.lpuRepository.find({ where: { freelancerId }, order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<Lpu> {
    const lpu = await this.lpuRepository.findOne({ where: { id } });
    if (!lpu) throw new NotFoundException('LPU não encontrada');
    return lpu;
  }

  async update(id: number, dto: UpdateLpuDto): Promise<Lpu> {
    const lpu = await this.findById(id);
    Object.assign(lpu, dto);
    return this.lpuRepository.save(lpu);
  }

  async delete(id: number): Promise<void> {
    const result = await this.lpuRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('LPU não encontrada');
  }
}
