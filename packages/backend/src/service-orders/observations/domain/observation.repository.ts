import { ServiceOrderObservation } from './observation.entity';

export const OBSERVATION_REPOSITORY = 'OBSERVATION_REPOSITORY';

export interface ObservationRepository {
  create(observation: ServiceOrderObservation): Promise<ServiceOrderObservation>;
  save(observation: ServiceOrderObservation): Promise<ServiceOrderObservation>;
  saveMany(observations: ServiceOrderObservation[]): Promise<void>;
  findById(id: number): Promise<ServiceOrderObservation | null>;
  findByServiceOrder(serviceOrderId: number): Promise<ServiceOrderObservation[]>;
  findMaxPosition(serviceOrderId: number): Promise<number>;
  delete(id: number): Promise<void>;
}
