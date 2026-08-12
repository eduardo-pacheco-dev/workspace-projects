import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOrderObservation, ObservationProps } from '../domain/observation.entity';
import { ObservationRepository } from '../domain/observation.repository';
import { ServiceOrderObservationEntity } from './observation.entity';

const OBSERVATION_FIELDS = [
  'id',
  'serviceOrderId',
  'title',
  'description',
  'position',
  'filename',
  'originalName',
  'mimetype',
  'size',
  'createdAt',
] as const;

const OBSERVATION_PERSISTENCE_FIELDS = OBSERVATION_FIELDS.filter(
  (field) => field !== 'createdAt',
);

@Injectable()
export class TypeOrmObservationRepository implements ObservationRepository {
  constructor(
    @InjectRepository(ServiceOrderObservationEntity)
    private readonly repo: Repository<ServiceOrderObservationEntity>,
  ) {}

  private toDomain(entity: ServiceOrderObservationEntity): ServiceOrderObservation {
    const props: Record<string, unknown> = {};
    for (const field of OBSERVATION_FIELDS) {
      props[field] = (entity as unknown as Record<string, unknown>)[field];
    }
    return new ServiceOrderObservation(props as unknown as ObservationProps);
  }

  private toPersistence(observation: ServiceOrderObservation): Partial<ServiceOrderObservationEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of OBSERVATION_PERSISTENCE_FIELDS) {
      entity[field] = (observation as unknown as Record<string, unknown>)[field] ?? null;
    }
    return entity as Partial<ServiceOrderObservationEntity>;
  }

  async create(observation: ServiceOrderObservation): Promise<ServiceOrderObservation> {
    const entity = this.repo.create(this.toPersistence(observation) as Partial<ServiceOrderObservationEntity>);
    return this.toDomain(await this.repo.save(entity));
  }

  async save(observation: ServiceOrderObservation): Promise<ServiceOrderObservation> {
    return this.toDomain(
      await this.repo.save(this.toPersistence(observation) as Partial<ServiceOrderObservationEntity>),
    );
  }

  async saveMany(observations: ServiceOrderObservation[]): Promise<void> {
    await this.repo.save(
      observations.map((observation) => this.toPersistence(observation) as Partial<ServiceOrderObservationEntity>),
    );
  }

  async findById(id: number): Promise<ServiceOrderObservation | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByServiceOrder(serviceOrderId: number): Promise<ServiceOrderObservation[]> {
    const rows = await this.repo.find({
      where: { serviceOrderId },
      order: { position: 'ASC', createdAt: 'DESC' },
    });
    return rows.map((entity) => this.toDomain(entity));
  }

  async findMaxPosition(serviceOrderId: number): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('o')
      .select('MAX(o.position)', 'max')
      .where('o.serviceOrderId = :serviceOrderId', { serviceOrderId })
      .getRawOne();
    return Number(result?.max) || 0;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
