import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOrder } from './service-order.entity';
import {
  CreateServiceOrderInput,
  UpdateServiceOrderInput,
} from './schemas/service-order.schemas';

@Injectable()
export class ServiceOrdersService {
  constructor(
    @InjectRepository(ServiceOrder)
    private readonly serviceOrdersRepository: Repository<ServiceOrder>,
  ) {}

  async create(dto: CreateServiceOrderInput): Promise<ServiceOrder> {
    const serviceOrder = this.serviceOrdersRepository.create({
      ...dto,
      status: dto.status ?? 'aberta',
    });
    return this.serviceOrdersRepository.save(serviceOrder);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    status?: string;
  }): Promise<{ data: ServiceOrder[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
    } = query;

    const qb = this.serviceOrdersRepository.createQueryBuilder('so');

    if (search) {
      qb.where(
        'so.numero LIKE :search OR so.cliente LIKE :search OR so.descricao LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('so.status = :status', { status });
    }

    const allowedSort = ['id', 'numero', 'cliente', 'data', 'valor', 'status'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`so.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrdersRepository.findOne({ where: { id } });
    if (!serviceOrder) throw new NotFoundException('Ordem de serviço não encontrada');
    return serviceOrder;
  }

  async update(id: number, dto: UpdateServiceOrderInput): Promise<ServiceOrder> {
    const serviceOrder = await this.findById(id);
    Object.assign(serviceOrder, dto);
    return this.serviceOrdersRepository.save(serviceOrder);
  }

  async delete(id: number): Promise<void> {
    const result = await this.serviceOrdersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Ordem de serviço não encontrada');
    }
  }
}
