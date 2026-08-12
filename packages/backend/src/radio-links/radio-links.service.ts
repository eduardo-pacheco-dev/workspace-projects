import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RadioLink } from './radio-link.entity';
import { StationEntity } from '../stations/infrastructure/station.entity';
import { CreateRadioLinkDto } from './dto/create-radio-link.dto';
import { UpdateRadioLinkDto } from './dto/update-radio-link.dto';
import { ImportRadioLinkItem } from './dto/import-radio-links.dto';

export interface RadioLinkQuery {
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
export class RadioLinksService {
  constructor(
    @InjectRepository(RadioLink)
    private readonly radioLinksRepository: Repository<RadioLink>,
    @InjectRepository(StationEntity)
    private readonly stationsRepository: Repository<StationEntity>,
  ) {}

  private async applyStations(radioLink: RadioLink, dto: CreateRadioLinkDto | UpdateRadioLinkDto): Promise<void> {
    if (dto.stationAId != null) {
      const station = await this.stationsRepository.findOne({ where: { id: dto.stationAId } });
      if (station) {
        radioLink.stationAId = station.id;
        radioLink.siteIdA = station.siteId;
        radioLink.endIdA = station.endId;
        radioLink.enderecoA = station.address;
        radioLink.latitudeA = station.latitude;
        radioLink.longitudeA = station.longitude;
        radioLink.operadoraA = station.mobileCarrier;
      }
    }
    if (dto.stationBId != null) {
      const station = await this.stationsRepository.findOne({ where: { id: dto.stationBId } });
      if (station) {
        radioLink.stationBId = station.id;
        radioLink.siteIdB = station.siteId;
        radioLink.endIdB = station.endId;
        radioLink.enderecoB = station.address;
        radioLink.latitudeB = station.latitude;
        radioLink.longitudeB = station.longitude;
        radioLink.operadoraB = station.mobileCarrier;
      }
    }
  }

  async create(dto: CreateRadioLinkDto): Promise<RadioLink> {
    const radioLink = this.radioLinksRepository.create(dto);
    await this.applyStations(radioLink, dto);
    return this.radioLinksRepository.save(radioLink);
  }

  async importRadioLinks(items: ImportRadioLinkItem[]): Promise<ImportResult> {
    const result: ImportResult = { imported: 0, updated: 0, skipped: 0, errors: [] };

    const cleanStr = (value: unknown): string | undefined => {
      return typeof value === 'string' && value.trim() ? value.trim() : undefined;
    };

    const parseCoord = (value: unknown): number | undefined => {
      if (value === undefined || value === null || value === '') return undefined;
      const num = Number(value);
      return Number.isFinite(num) ? num : undefined;
    };

    const parsed: { data: Partial<RadioLink>; row: number }[] = [];
    items.forEach((item, index) => {
      const row = index + 1;
      const nome = typeof item.nome === 'string' ? item.nome.trim() : '';
      if (!nome) {
        result.skipped++;
        result.errors.push(`Linha ${row}: Nome é obrigatório.`);
        return;
      }

      parsed.push({
        row,
        data: {
          nome,
          frequencia: cleanStr(item.frequencia),
          capacidade: cleanStr(item.capacidade),
          siteIdA: cleanStr(item.siteIdA),
          endIdA: cleanStr(item.endIdA),
          enderecoA: cleanStr(item.enderecoA),
          latitudeA: parseCoord(item.latitudeA),
          longitudeA: parseCoord(item.longitudeA),
          operadoraA: cleanStr(item.operadoraA),
          siteIdB: cleanStr(item.siteIdB),
          endIdB: cleanStr(item.endIdB),
          enderecoB: cleanStr(item.enderecoB),
          latitudeB: parseCoord(item.latitudeB),
          longitudeB: parseCoord(item.longitudeB),
          operadoraB: cleanStr(item.operadoraB),
          observacoes: cleanStr(item.observacoes),
          status: item.status === 'inativo' ? 'inativo' : 'ativo',
        },
      });
    });

    if (parsed.length === 0) return result;

    const stations = await this.stationsRepository.find();
    const bySiteId = new Map<string, StationEntity>();
    const bySiteAndEnd = new Map<string, StationEntity>();
    for (const s of stations) {
      if (s.siteId) bySiteId.set(s.siteId, s);
      if (s.siteId && s.endId) bySiteAndEnd.set(`${s.siteId}::${s.endId}`, s);
    }

    const resolveStation = (
      siteId: string | undefined,
      endId: string | undefined,
      operadora: string | undefined,
    ): StationEntity | null => {
      if (!siteId) return null;
      if (operadora === 'TIM' && endId) {
        return bySiteAndEnd.get(`${siteId}::${endId}`) ?? bySiteId.get(siteId) ?? null;
      }
      return bySiteId.get(siteId) ?? null;
    };

    for (const item of parsed) {
      const stationA = resolveStation(item.data.siteIdA, item.data.endIdA, item.data.operadoraA);
      if (stationA) {
        item.data.stationAId = stationA.id;
        item.data.siteIdA = stationA.siteId;
        item.data.endIdA = stationA.endId;
        item.data.enderecoA = stationA.address;
        item.data.latitudeA = stationA.latitude;
        item.data.longitudeA = stationA.longitude;
        item.data.operadoraA = stationA.mobileCarrier;
      }
      const stationB = resolveStation(item.data.siteIdB, item.data.endIdB, item.data.operadoraB);
      if (stationB) {
        item.data.stationBId = stationB.id;
        item.data.siteIdB = stationB.siteId;
        item.data.endIdB = stationB.endId;
        item.data.enderecoB = stationB.address;
        item.data.latitudeB = stationB.latitude;
        item.data.longitudeB = stationB.longitude;
        item.data.operadoraB = stationB.mobileCarrier;
      }
    }

    const existing = await this.radioLinksRepository.find({ select: ['id', 'nome'] });
    const byNome = new Map(existing.map((r) => [r.nome, r.id]));

    const pendingInsert = new Map<string, Partial<RadioLink>>();
    const toUpdate: { id: number; data: Partial<RadioLink> }[] = [];

    for (const { data } of parsed) {
      const existingId = byNome.get(data.nome!);
      if (existingId) {
        toUpdate.push({ id: existingId, data });
      } else {
        pendingInsert.set(data.nome!, data);
      }
    }

    if (pendingInsert.size > 0) {
      await this.radioLinksRepository.insert([...pendingInsert.values()]);
      result.imported = pendingInsert.size;
    }

    for (const { id, data } of toUpdate) {
      await this.radioLinksRepository.update(id, data);
      result.updated++;
    }

    return result;
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
