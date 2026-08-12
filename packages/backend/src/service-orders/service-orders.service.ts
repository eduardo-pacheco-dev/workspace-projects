import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ServiceOrder } from './domain/service-order.entity';
import {
  ServiceOrderRepository,
  ServiceOrderQuery,
  PaginatedServiceOrders,
  SERVICE_ORDER_REPOSITORY,
} from './domain/service-order.repository';
import { generateServiceOrderNumero } from './domain/service-order-rules';
import {
  CreateServiceOrderInput,
  UpdateServiceOrderInput,
} from './schemas/service-order.schemas';

@Injectable()
export class ServiceOrdersService {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly serviceOrdersRepository: ServiceOrderRepository,
  ) {}

  async create(dto: CreateServiceOrderInput): Promise<ServiceOrder> {
    let saved = await this.serviceOrdersRepository.create(
      new ServiceOrder({ ...dto, numero: '' }),
    );
    if (!saved.numero) {
      saved = await this.serviceOrdersRepository.save(
        new ServiceOrder({ ...saved, numero: generateServiceOrderNumero(saved.id ?? 0) }),
      );
    }
    return saved;
  }

  async findAll(query: ServiceOrderQuery): Promise<PaginatedServiceOrders> {
    return this.serviceOrdersRepository.findAll(query);
  }

  async findById(id: number): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrdersRepository.findById(id);
    if (!serviceOrder) throw new NotFoundException('Ordem de serviço não encontrada');
    return serviceOrder;
  }

  async update(id: number, dto: UpdateServiceOrderInput): Promise<ServiceOrder> {
    const serviceOrder = await this.findById(id);
    Object.assign(serviceOrder, dto);
    return this.serviceOrdersRepository.save(serviceOrder);
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.serviceOrdersRepository.delete(id);
    if (!deleted) throw new NotFoundException('Ordem de serviço não encontrada');
  }
}
