import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ServiceOrder, ServiceOrderProps } from '../domain/service-order.entity';
import {
  ServiceOrderRepository,
  ServiceOrderQuery,
  PaginatedServiceOrders,
} from '../domain/service-order.repository';
import { ServiceOrderEntity } from './service-order.entity';

const SERVICE_ORDER_FIELDS = [
  'id',
  'numero',
  'cliente',
  'descricao',
  'siteId',
  'endId',
  'operadora',
  'endereco',
  'dataInicio',
  'dataFim',
  'status',
  'observacoes',
  'createdAt',
  'updatedAt',
] as const;

const SERVICE_ORDER_PERSISTENCE_FIELDS = SERVICE_ORDER_FIELDS.filter(
  (field) => field !== 'createdAt' && field !== 'updatedAt',
);

const SEARCH_CLAUSE = 'so.numero LIKE :search OR so.cliente LIKE :search OR so.descricao LIKE :search';

const ALLOWED_SORT_COLUMNS = [
  'id',
  'numero',
  'cliente',
  'dataInicio',
  'status',
  'siteId',
  'operadora',
];

@Injectable()
export class TypeOrmServiceOrderRepository implements ServiceOrderRepository {
  constructor(
    @InjectRepository(ServiceOrderEntity)
    private readonly repo: Repository<ServiceOrderEntity>,
  ) {}

  private toDomain(entity: ServiceOrderEntity): ServiceOrder {
    const props: Record<string, unknown> = {};
    for (const field of SERVICE_ORDER_FIELDS) {
      props[field] = (entity as unknown as Record<string, unknown>)[field];
    }
    return new ServiceOrder(props as unknown as ServiceOrderProps);
  }

  private toPersistence(serviceOrder: ServiceOrder): Partial<ServiceOrderEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of SERVICE_ORDER_PERSISTENCE_FIELDS) {
      entity[field] = (serviceOrder as unknown as Record<string, unknown>)[field] ?? null;
    }
    return entity as Partial<ServiceOrderEntity>;
  }

  private applyFilters(
    qb: SelectQueryBuilder<ServiceOrderEntity>,
    search: string | undefined,
    status: string | undefined,
  ): void {
    if (search) {
      qb.where(SEARCH_CLAUSE, { search: `%${search}%` });
    }
    if (status) {
      qb.andWhere('so.status = :status', { status });
    }
  }

  async create(serviceOrder: ServiceOrder): Promise<ServiceOrder> {
    const entity = this.repo.create(this.toPersistence(serviceOrder) as Partial<ServiceOrderEntity>);
    return this.toDomain(await this.repo.save(entity));
  }

  async save(serviceOrder: ServiceOrder): Promise<ServiceOrder> {
    return this.toDomain(
      await this.repo.save(this.toPersistence(serviceOrder) as Partial<ServiceOrderEntity>),
    );
  }

  async findAll(query: ServiceOrderQuery): Promise<PaginatedServiceOrders> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
    } = query;

    const qb = this.repo.createQueryBuilder('so');
    this.applyFilters(qb, search, status);

    const safeSort = ALLOWED_SORT_COLUMNS.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`so.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map((entity) => this.toDomain(entity)), total };
  }

  async findById(id: number): Promise<ServiceOrder | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected !== 0;
  }
}
