import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

export interface StationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  operadora?: string;
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
