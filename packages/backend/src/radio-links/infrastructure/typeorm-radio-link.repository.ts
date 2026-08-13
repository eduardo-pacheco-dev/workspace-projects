import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RadioLink, RadioLinkProps } from '../domain/radio-link.entity';
import {
  RadioLinkRepository,
  RadioLinkQuery,
  PaginatedRadioLinks,
  StationRef,
} from '../domain/radio-link.repository';
import { StationEntity } from '../../stations/infrastructure/station.entity';
import { RadioLinkEntity } from './radio-link.entity';

const RADIO_LINK_FIELDS = [
  'id',
  'nome',
  'frequencia',
  'capacidade',
  'stationAId',
  'siteIdA',
  'endIdA',
  'enderecoA',
  'latitudeA',
  'longitudeA',
  'operadoraA',
  'stationBId',
  'siteIdB',
  'endIdB',
  'enderecoB',
  'latitudeB',
  'longitudeB',
  'operadoraB',
  'observacoes',
  'status',
  'createdAt',
  'updatedAt',
] as const;

const RADIO_LINK_PERSISTENCE_FIELDS = RADIO_LINK_FIELDS.filter(
  (field) => field !== 'createdAt' && field !== 'updatedAt',
);

const SEARCH_CLAUSE =
  'rl.nome LIKE :search OR rl.siteIdA LIKE :search OR rl.siteIdB LIKE :search OR rl.endIdA LIKE :search OR rl.endIdB LIKE :search OR rl.operadoraA LIKE :search OR rl.operadoraB LIKE :search';

const ALLOWED_SORT_COLUMNS = [
  'id',
  'nome',
  'frequencia',
  'capacidade',
  'siteIdA',
  'siteIdB',
  'status',
  'createdAt',
];

@Injectable()
export class TypeOrmRadioLinkRepository implements RadioLinkRepository {
  constructor(
    @InjectRepository(RadioLinkEntity)
    private readonly radioLinksRepo: Repository<RadioLinkEntity>,
    @InjectRepository(StationEntity)
    private readonly stationsRepo: Repository<StationEntity>,
  ) {}

  private toDomain(entity: RadioLinkEntity): RadioLink {
    const props: Record<string, unknown> = {};
    for (const field of RADIO_LINK_FIELDS) {
      props[field] = (entity as unknown as Record<string, unknown>)[field];
    }
    return new RadioLink(props as unknown as RadioLinkProps);
  }

  private toPersistence(radioLink: RadioLink): Partial<RadioLinkEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of RADIO_LINK_PERSISTENCE_FIELDS) {
      entity[field] = (radioLink as unknown as Record<string, unknown>)[field] ?? null;
    }
    return entity as Partial<RadioLinkEntity>;
  }

  private toPartialPersistence(data: Partial<RadioLinkProps>): Partial<RadioLinkEntity> {
    const entity: Record<string, unknown> = {};
    for (const field of RADIO_LINK_PERSISTENCE_FIELDS) {
      if (data[field as keyof RadioLinkProps] !== undefined) {
        entity[field] = data[field as keyof RadioLinkProps];
      }
    }
    return entity as Partial<RadioLinkEntity>;
  }

  private toStationRef(station: StationEntity): StationRef {
    return {
      id: station.id,
      siteId: station.siteId,
      endId: station.endId,
      address: station.address,
      latitude: station.latitude,
      longitude: station.longitude,
      mobileCarrier: station.mobileCarrier,
    };
  }

  private applyFilters(
    qb: SelectQueryBuilder<RadioLinkEntity>,
    search: string | undefined,
    status: string | undefined,
    operadora: string | undefined,
  ): void {
    if (search) {
      qb.where(SEARCH_CLAUSE, { search: `%${search}%` });
    }
    if (status) {
      qb.andWhere('rl.status = :status', { status });
    }
    if (operadora) {
      qb.andWhere('rl.operadoraA = :operadora OR rl.operadoraB = :operadora', { operadora });
    }
  }

  async create(radioLink: RadioLink): Promise<RadioLink> {
    const entity = this.radioLinksRepo.create(this.toPersistence(radioLink) as Partial<RadioLinkEntity>);
    return this.toDomain(await this.radioLinksRepo.save(entity));
  }

  async save(radioLink: RadioLink): Promise<RadioLink> {
    return this.toDomain(
      await this.radioLinksRepo.save(this.toPersistence(radioLink) as Partial<RadioLinkEntity>),
    );
  }

  async findAll(query: RadioLinkQuery): Promise<PaginatedRadioLinks> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
      operadora,
    } = query;

    const qb = this.radioLinksRepo.createQueryBuilder('rl');
    this.applyFilters(qb, search, status, operadora);

    const safeSort = ALLOWED_SORT_COLUMNS.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`rl.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: data.map((entity) => this.toDomain(entity)), total };
  }

  async findById(id: number): Promise<RadioLink | null> {
    const entity = await this.radioLinksRepo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.radioLinksRepo.delete(id);
    return result.affected !== 0;
  }

  async findStationById(id: number): Promise<StationRef | null> {
    const station = await this.stationsRepo.findOne({ where: { id } });
    return station ? this.toStationRef(station) : null;
  }

  async findAllStations(): Promise<StationRef[]> {
    const stations = await this.stationsRepo.find();
    return stations.map((station) => this.toStationRef(station));
  }

  async findExistingNames(): Promise<{ id: number; nome: string }[]> {
    const rows = await this.radioLinksRepo.find({ select: ['id', 'nome'] });
    return rows.map((row) => ({ id: row.id, nome: row.nome }));
  }

  async insertMany(radioLinks: RadioLink[]): Promise<void> {
    await this.radioLinksRepo.insert(
      radioLinks.map((radioLink) => this.toPersistence(radioLink) as Partial<RadioLinkEntity>),
    );
  }

  async update(id: number, data: Partial<RadioLinkProps>): Promise<void> {
    await this.radioLinksRepo.update(id, this.toPartialPersistence(data));
  }
}
