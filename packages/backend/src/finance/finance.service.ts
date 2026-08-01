import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { FinanceEntry } from './finance-entry.entity';
import {
  CreateFinanceEntryInput,
  UpdateFinanceEntryInput,
} from './schemas/finance.schemas';

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateRecurrenceDates(startDate: string, recurrence: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (isNaN(current.getTime()) || isNaN(end.getTime()) || current > end) {
    return [startDate];
  }
  let guard = 0;
  while (current <= end && guard < 500) {
    dates.push(toISODate(current));
    switch (recurrence) {
      case 'daily':
        current.setDate(current.getDate() + 1);
        break;
      case 'weekly':
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
      case 'yearly':
        current.setFullYear(current.getFullYear() + 1);
        break;
      default:
        return dates;
    }
    guard += 1;
  }
  return dates;
}

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
  accountId?: number;
  cardId?: number;
}

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinanceEntry)
    private readonly entriesRepository: Repository<FinanceEntry>,
  ) {}

  async create(dto: CreateFinanceEntryInput): Promise<FinanceEntry | FinanceEntry[]> {
    const { recurrence, recurrenceEnd, ...rest } = dto;
    const effectiveRecurrence = recurrence && recurrence !== 'once' ? recurrence : null;

    if (effectiveRecurrence && recurrenceEnd && rest.date) {
      const dates = generateRecurrenceDates(rest.date, effectiveRecurrence, recurrenceEnd);
      const seriesId = randomUUID();
      const entries = dates.map((date) =>
        this.entriesRepository.create({
          ...rest,
          date,
          status: dto.status ?? 'paid',
          recurrence: effectiveRecurrence,
          recurrenceEnd,
          seriesId,
        }),
      );
      return this.entriesRepository.save(entries);
    }

    const entry = this.entriesRepository.create({
      ...rest,
      status: dto.status ?? 'paid',
      recurrence: effectiveRecurrence,
      recurrenceEnd: effectiveRecurrence ? recurrenceEnd ?? null : null,
      seriesId: null,
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
      accountId,
      cardId,
    } = query;

    const qb = this.entriesRepository
      .createQueryBuilder('fe')
      .leftJoinAndSelect('fe.account', 'account')
      .leftJoinAndSelect('fe.card', 'card');

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
    if (accountId) {
      qb.andWhere('fe.accountId = :accountId', { accountId });
    }
    if (cardId) {
      qb.andWhere('fe.cardId = :cardId', { cardId });
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
    const entry = await this.entriesRepository.findOne({
      where: { id },
      relations: ['account', 'card'],
    });
    if (!entry) throw new NotFoundException('Lançamento não encontrado');
    return entry;
  }

  async update(id: number, dto: UpdateFinanceEntryInput): Promise<FinanceEntry> {
    const entry = await this.findById(id);
    Object.assign(entry, dto);
    return this.entriesRepository.save(entry);
  }

  async updateAttachment(id: number, attachment: string | null): Promise<FinanceEntry> {
    const entry = await this.findById(id);
    entry.attachment = attachment;
    return this.entriesRepository.save(entry);
  }

  async delete(id: number): Promise<void> {
    const result = await this.entriesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Lançamento não encontrado');
    }
  }
}
