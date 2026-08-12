import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { Station } from './domain/station.entity';
import {
  StationRepository,
  StationQuery,
  PaginatedStations,
  ImportResult,
  STATION_REPOSITORY,
} from './domain/station.repository';
import { buildStationKey, parseImportItem, StationImportItem } from './domain/station-rules';

export type { StationQuery, ImportResult } from './domain/station.repository';

@Injectable()
export class StationsService {
  constructor(
    @Inject(STATION_REPOSITORY)
    private readonly stationsRepository: StationRepository,
  ) {}

  async create(dto: CreateStationDto): Promise<Station> {
    const station = Station.fromProps({ ...dto });
    return this.stationsRepository.create(station);
  }

  async importStations(items: StationImportItem[]): Promise<ImportResult> {
    const result: ImportResult = { imported: 0, updated: 0, skipped: 0, errors: [] };

    const parsed: { station: Station }[] = [];
    items.forEach((item, index) => {
      const row = index + 1;
      const { station, error } = parseImportItem(item, row);
      if (station) {
        parsed.push({ station });
      } else {
        result.skipped++;
        result.errors.push(error ?? `Linha ${row}: Dados inválidos.`);
      }
    });

    if (parsed.length === 0) return result;

    const existing = await this.stationsRepository.findExistingRefs();
    const existingByKey = new Map(existing.map((s) => [buildStationKey(s.siteId, s.endId), s]));

    const pendingInsert = new Map<string, Station>();
    const toUpdate: { id: number; station: Station }[] = [];

    for (const { station } of parsed) {
      const key = buildStationKey(station.siteId, station.endId);
      const existingStation = existingByKey.get(key);
      if (existingStation) {
        toUpdate.push({ id: existingStation.id, station });
      } else {
        pendingInsert.set(key, station);
      }
    }

    if (pendingInsert.size > 0) {
      await this.stationsRepository.insertMany([...pendingInsert.values()]);
      result.imported = pendingInsert.size;
    }

    for (const { id, station } of toUpdate) {
      await this.stationsRepository.update(id, station);
      result.updated++;
    }

    return result;
  }

  async findAll(query: StationQuery): Promise<PaginatedStations> {
    return this.stationsRepository.findAll(query);
  }

  async findById(id: number): Promise<Station> {
    const station = await this.stationsRepository.findById(id);
    if (!station) throw new NotFoundException('Estação não encontrada');
    return station;
  }

  async update(id: number, dto: UpdateStationDto): Promise<Station> {
    const station = await this.findById(id);
    Object.assign(station, dto);
    station.applyEndIdRule();
    await this.stationsRepository.update(id, station);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.stationsRepository.delete(id);
    if (!deleted) throw new NotFoundException('Estação não encontrada');
  }
}
