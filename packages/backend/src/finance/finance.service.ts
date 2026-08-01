import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinanceEntry } from './finance-entry.entity';
import {
  CreateFinanceEntryInput,
  UpdateFinanceEntryInput,
} from './schemas/finance.schemas';

export interface FinanceEntryQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  type?: string;
  status?: string;
  category?: string;
  month?: number;
  year?: number;
}

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinanceEntry)
    private readonly entriesRepository: Repository<FinanceEntry>,
  ) {}

  async create(dto: CreateFinanceEntryInput): Promise<FinanceEntry> {
    const entry = this.entriesRepository.create({
      ...dto,
      status: dto.status ?? 'paid',
    });
    return this.entriesRepository.save(entry);
  }

  async findAll(query: FinanceEntryQuery): Promise<{ data: FinanceEntry[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'DESC' as 'ASC' | 'DESC',
      search,
      type,
      status,
      category,
      month,
      year,
    } = query;

    const qb = this.entriesRepository.createQueryBuilder('fe');

    if (search) {
      qb.where(
        'fe.description LIKE :search OR fe.category LIKE :search OR fe.notes LIKE :search',
        { search: `%${search}%` },
      );
    }
    if (type) {
      qb.andWhere('fe.type = :type', { type });
    }
    if (status) {
      qb.andWhere('fe.status = :status', { status });
    }
    if (category) {
      qb.andWhere('fe.category = :category', { category });
    }
    if (month) {
      qb.andWhere('MONTH(fe.date) = :month', { month });
    }
    if (year) {
      qb.andWhere('YEAR(fe.date) = :year', { year });
    }

    const allowedSort = ['id', 'date', 'type', 'category', 'amount', 'status', 'description'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'date';
    const safeOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const [data, total] = await qb
      .orderBy(`fe.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<FinanceEntry> {
    const entry = await this.entriesRepository.findOne({ where: { id } });
    if (!entry) throw new NotFoundException('Entry not found');
    return entry;
  }

  async update(id: number, dto: UpdateFinanceEntryInput): Promise<FinanceEntry> {
    const entry = await this.findById(id);
    Object.assign(entry, dto);
    return this.entriesRepository.save(entry);
  }

  async delete(id: number): Promise<void> {
    const result = await this.entriesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Entry not found');
    }
  }
}
