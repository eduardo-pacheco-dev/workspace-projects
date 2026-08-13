import { ServiceOrder } from './service-order.entity';

export const SERVICE_ORDER_REPOSITORY = 'SERVICE_ORDER_REPOSITORY';

export interface ServiceOrderQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
}

export interface PaginatedServiceOrders {
  data: ServiceOrder[];
  total: number;
}

export interface ServiceOrderRepository {
  create(serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  save(serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  findAll(query: ServiceOrderQuery): Promise<PaginatedServiceOrders>;
  findById(id: number): Promise<ServiceOrder | null>;
  delete(id: number): Promise<boolean>;
}
