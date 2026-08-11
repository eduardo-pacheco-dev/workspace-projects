import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from '../domain/station.entity';
import {
  StationRepository,
  StationQuery,
  PaginatedStations,
  StationRef,
} from '../domain/station.repository';
import { StationEntity } from './station.entity';

@Injectable()
export class TypeOrmStationRepository implements StationRepository {
  constructor(
    @InjectRepository(StationEntity)
    private readonly repo: Repository<StationEntity>,
  ) {}

  private toDomain(entity: StationEntity): Station {
    return new Station({ ...entity });
  }

  private toPersistence(station: Station): Partial<StationEntity> {
    return {
      siteId: station.siteId,
      endId: station.endId,
      endereco: station.endereco ?? undefined,
      latitude: station.latitude ?? undefined,
      longitude: station.longitude ?? undefined,
      operadora: station.operadora ?? undefined,
      observacoes: station.observacoes ?? undefined,
      status: station.status,
    };
  }

  async create(station: Station): Promise<Station> {
    const entity = this.repo.create(this.toPersistence(station));
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findAll(query: StationQuery): Promise<PaginatedStations> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
      operadora,
    } = query;

    const qb = this.repo.createQueryBuilder('s');

    if (search) {
      qb.where(
        's.siteId LIKE :search OR s.endId LIKE :search OR s.endereco LIKE :search OR s.operadora LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('s.status = :status', { status });
    }

    if (operadora) {
      qb.andWhere('s.operadora = :operadora', { operadora });
    }

    const allowedSort = ['id', 'siteId', 'endId', 'endereco', 'operadora', 'status', 'createdAt'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`s.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map((entity) => this.toDomain(entity)), total };
  }

  async findById(id: number): Promise<Station | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findExistingRefs(): Promise<StationRef[]> {
    const entities = await this.repo.find({ select: ['id', 'siteId', 'endId'] });
    return entities.map((e) => ({ id: e.id, siteId: e.siteId, endId: e.endId }));
  }

  async insertMany(stations: Station[]): Promise<void> {
    await this.repo.insert(stations.map((s) => this.toPersistence(s)));
  }

  async update(id: number, station: Station): Promise<void> {
    await this.repo.update(id, this.toPersistence(station));
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected !== 0;
  }
}
