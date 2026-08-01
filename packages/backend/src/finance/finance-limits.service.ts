import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpendingLimit } from './spending-limit.entity';
import {
  CreateSpendingLimitInput,
  UpdateSpendingLimitInput,
} from './schemas/finance.schemas';

export interface SpendingLimitQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  month?: number;
  year?: number;
}

@Injectable()
export class FinanceLimitsService {
  constructor(
    @InjectRepository(SpendingLimit)
    private readonly limitsRepository: Repository<SpendingLimit>,
  ) {}

  async create(dto: CreateSpendingLimitInput): Promise<SpendingLimit> {
    const limit = this.limitsRepository.create(dto);
    return this.limitsRepository.save(limit);
  }

  async findAll(query: SpendingLimitQuery): Promise<{ data: SpendingLimit[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'category',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      month,
      year,
    } = query;

    const qb = this.limitsRepository.createQueryBuilder('sl');

    if (search) {
      qb.where('sl.category LIKE :search', { search: `%${search}%` });
    }
    if (month) {
      qb.andWhere('sl.month = :month', { month });
    }
    if (year) {
      qb.andWhere('sl.year = :year', { year });
    }

    const allowedSort = ['id', 'category', 'month', 'year', 'amount'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'category';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`sl.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<SpendingLimit> {
    const limit = await this.limitsRepository.findOne({ where: { id } });
    if (!limit) throw new NotFoundException('Limite de gasto não encontrado');
    return limit;
  }

  async update(id: number, dto: UpdateSpendingLimitInput): Promise<SpendingLimit> {
    const limit = await this.findById(id);
    Object.assign(limit, dto);
    return this.limitsRepository.save(limit);
  }

  async delete(id: number): Promise<void> {
    const result = await this.limitsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Limite de gasto não encontrado');
    }
  }
}
