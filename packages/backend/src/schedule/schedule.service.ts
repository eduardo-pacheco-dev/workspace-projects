import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEvent } from './schedule-event.entity';
import {
  CreateScheduleEventInput,
  UpdateScheduleEventInput,
} from './schedule-event.schemas';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEvent)
    private readonly scheduleRepository: Repository<ScheduleEvent>,
  ) {}

  async create(dto: CreateScheduleEventInput): Promise<ScheduleEvent> {
    const event = this.scheduleRepository.create({
      ...dto,
      status: dto.status ?? 'scheduled',
    });
    return this.scheduleRepository.save(event);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    status?: string;
    from?: string;
    to?: string;
  }): Promise<{ data: ScheduleEvent[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'startAt',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
      from,
      to,
    } = query;

    const qb = this.scheduleRepository.createQueryBuilder('ev');

    if (search) {
      qb.where(
        'ev.title LIKE :search OR ev.client LIKE :search OR ev.location LIKE :search OR ev.assignedTo LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('ev.status = :status', { status });
    }

    if (from) {
      qb.andWhere('ev.startAt >= :from', { from });
    }

    if (to) {
      qb.andWhere('ev.startAt <= :to', { to });
    }

    const allowedSort = ['id', 'title', 'startAt', 'endAt', 'status', 'client', 'location', 'assignedTo'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'startAt';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`ev.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<ScheduleEvent> {
    const event = await this.scheduleRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Agendamento não encontrado');
    return event;
  }

  async update(id: number, dto: UpdateScheduleEventInput): Promise<ScheduleEvent> {
    const event = await this.findById(id);
    Object.assign(event, dto);
    return this.scheduleRepository.save(event);
  }

  async delete(id: number): Promise<void> {
    const result = await this.scheduleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Agendamento não encontrado');
    }
  }
}
