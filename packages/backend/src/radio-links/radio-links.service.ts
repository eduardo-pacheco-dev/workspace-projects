import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RadioLink } from './radio-link.entity';
import { Station } from '../stations/station.entity';
import { CreateRadioLinkDto } from './dto/create-radio-link.dto';
import { UpdateRadioLinkDto } from './dto/update-radio-link.dto';

export interface RadioLinkQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  operadora?: string;
}

@Injectable()
export class RadioLinksService {
  constructor(
    @InjectRepository(RadioLink)
    private readonly radioLinksRepository: Repository<RadioLink>,
    @InjectRepository(Station)
    private readonly stationsRepository: Repository<Station>,
  ) {}

  private async applyStations(radioLink: RadioLink, dto: CreateRadioLinkDto | UpdateRadioLinkDto): Promise<void> {
    if (dto.stationAId != null) {
      const station = await this.stationsRepository.findOne({ where: { id: dto.stationAId } });
      if (station) {
        radioLink.stationAId = station.id;
        radioLink.siteIdA = station.siteId;
        radioLink.endIdA = station.endId;
        radioLink.enderecoA = station.endereco;
        radioLink.latitudeA = station.latitude;
        radioLink.longitudeA = station.longitude;
        radioLink.operadoraA = station.operadora;
      }
    }
    if (dto.stationBId != null) {
      const station = await this.stationsRepository.findOne({ where: { id: dto.stationBId } });
      if (station) {
        radioLink.stationBId = station.id;
        radioLink.siteIdB = station.siteId;
        radioLink.endIdB = station.endId;
        radioLink.enderecoB = station.endereco;
        radioLink.latitudeB = station.latitude;
        radioLink.longitudeB = station.longitude;
        radioLink.operadoraB = station.operadora;
      }
    }
  }

  async create(dto: CreateRadioLinkDto): Promise<RadioLink> {
    const radioLink = this.radioLinksRepository.create(dto);
    await this.applyStations(radioLink, dto);
    return this.radioLinksRepository.save(radioLink);
  }

  async findAll(query: RadioLinkQuery): Promise<{ data: RadioLink[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC' as 'ASC' | 'DESC',
      search,
      status,
      operadora,
    } = query;

    const qb = this.radioLinksRepository
      .createQueryBuilder('rl')
      .leftJoinAndSelect('rl.stationA', 'stationA')
      .leftJoinAndSelect('rl.stationB', 'stationB');

    if (search) {
      qb.where(
        'rl.nome LIKE :search OR rl.siteIdA LIKE :search OR rl.siteIdB LIKE :search OR rl.endIdA LIKE :search OR rl.endIdB LIKE :search OR rl.operadoraA LIKE :search OR rl.operadoraB LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('rl.status = :status', { status });
    }

    if (operadora) {
      qb.andWhere('rl.operadoraA = :operadora OR rl.operadoraB = :operadora', { operadora });
    }

    const allowedSort = ['id', 'nome', 'frequencia', 'capacidade', 'siteIdA', 'siteIdB', 'status', 'createdAt'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
    const safeOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, total] = await qb
      .orderBy(`rl.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<RadioLink> {
    const radioLink = await this.radioLinksRepository.findOne({
      where: { id },
      relations: ['stationA', 'stationB'],
    });
    if (!radioLink) throw new NotFoundException('Enlace de rádio não encontrado');
    return radioLink;
  }

  async update(id: number, dto: UpdateRadioLinkDto): Promise<RadioLink> {
    const radioLink = await this.findById(id);
    Object.assign(radioLink, dto);
    await this.applyStations(radioLink, dto);
    return this.radioLinksRepository.save(radioLink);
  }

  async delete(id: number): Promise<void> {
    const result = await this.radioLinksRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Enlace de rádio não encontrado');
  }
}
