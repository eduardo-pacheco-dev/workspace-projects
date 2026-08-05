import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { ImportStationItem } from './dto/import-stations.dto';

export interface StationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  operadora?: string;
}

export interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private readonly stationsRepository: Repository<Station>,
  ) {}

  async create(dto: CreateStationDto): Promise<Station> {
    const station = this.stationsRepository.create(dto);
    return this.stationsRepository.save(station);
  }

  async importStations(items: ImportStationItem[]): Promise<ImportResult> {
    const result: ImportResult = { imported: 0, updated: 0, skipped: 0, errors: [] };

    const parsed: { data: Partial<Station>; row: number }[] = [];
    items.forEach((item, index) => {
      const row = index + 1;
      const siteId = typeof item.siteId === 'string' ? item.siteId.trim() : '';
      const endId = typeof item.endId === 'string' ? item.endId.trim() : '';

      if (!siteId || !endId) {
        result.skipped++;
        result.errors.push(`Linha ${row}: Site ID e End ID são obrigatórios.`);
        return;
      }

      const status = item.status === 'inativo' ? 'inativo' : 'ativo';
      const operadora =
        typeof item.operadora === 'string' && item.operadora.trim()
          ? item.operadora.trim()
          : undefined;
      const endereco =
        typeof item.endereco === 'string' && item.endereco.trim()
          ? item.endereco.trim()
          : undefined;
      const observacoes =
        typeof item.observacoes === 'string' && item.observacoes.trim()
          ? item.observacoes.trim()
          : undefined;

      const parseCoord = (value: unknown): number | undefined => {
        if (value === undefined || value === null || value === '') return undefined;
        const num = Number(value);
        return Number.isFinite(num) ? num : undefined;
      };

      parsed.push({
        row,
        data: {
          siteId,
          endId,
          endereco,
          latitude: parseCoord(item.latitude),
          longitude: parseCoord(item.longitude),
          operadora,
          observacoes,
          status,
        },
      });
    });

    if (parsed.length === 0) return result;

    const existing = await this.stationsRepository.find({ select: ['id', 'siteId', 'endId'] });
    const existingByKey = new Map(existing.map((s) => [`${s.siteId}::${s.endId}`, s]));

    const pendingInsert = new Map<string, Partial<Station>>();
    const toUpdate: { id: number; data: Partial<Station> }[] = [];

    for (const { data } of parsed) {
      const key = `${data.siteId}::${data.endId}`;
      const existingStation = existingByKey.get(key);
      if (existingStation) {
        toUpdate.push({ id: existingStation.id, data });
      } else {
        pendingInsert.set(key, data);
      }
    }

    if (pendingInsert.size > 0) {
      await this.stationsRepository.insert([...pendingInsert.values()]);
      result.imported = pendingInsert.size;
    }

    for (const { id, data } of toUpdate) {
      await this.stationsRepository.update(id, data);
      result.updated++;
    }

    return result;
  }

  async findAll(query: StationQuery): Promise<{ data: Station[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
      operadora,
    } = query;

    const qb = this.stationsRepository.createQueryBuilder('s');

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

    return { data, total };
  }

  async findById(id: number): Promise<Station> {
    const station = await this.stationsRepository.findOne({ where: { id } });
    if (!station) throw new NotFoundException('Estação não encontrada');
    return station;
  }

  async update(id: number, dto: UpdateStationDto): Promise<Station> {
    const station = await this.findById(id);
    Object.assign(station, dto);
    return this.stationsRepository.save(station);
  }

  async delete(id: number): Promise<void> {
    const result = await this.stationsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Estação não encontrada');
  }
}
