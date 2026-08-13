import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { RadioLink } from './domain/radio-link.entity';
import {
  RadioLinkRepository,
  RadioLinkQuery,
  PaginatedRadioLinks,
  ImportResult,
  RADIO_LINK_REPOSITORY,
} from './domain/radio-link.repository';
import {
  applyStationSnapshot,
  buildStationIndex,
  parseImportItem,
  resolveStation,
  RadioLinkImportItem,
} from './domain/radio-link-rules';
import { CreateRadioLinkDto } from './dto/create-radio-link.dto';
import { UpdateRadioLinkDto } from './dto/update-radio-link.dto';

@Injectable()
export class RadioLinksService {
  constructor(
    @Inject(RADIO_LINK_REPOSITORY)
    private readonly radioLinksRepository: RadioLinkRepository,
  ) {}

  private async applyStations(
    radioLink: RadioLink,
    dto: CreateRadioLinkDto | UpdateRadioLinkDto,
  ): Promise<void> {
    if (dto.stationAId != null) {
      const station = await this.radioLinksRepository.findStationById(dto.stationAId);
      if (station) applyStationSnapshot(radioLink, station, 'A');
    }
    if (dto.stationBId != null) {
      const station = await this.radioLinksRepository.findStationById(dto.stationBId);
      if (station) applyStationSnapshot(radioLink, station, 'B');
    }
  }

  async create(dto: CreateRadioLinkDto): Promise<RadioLink> {
    const radioLink = new RadioLink({ ...dto });
    await this.applyStations(radioLink, dto);
    return this.radioLinksRepository.create(radioLink);
  }

  async importRadioLinks(items: RadioLinkImportItem[]): Promise<ImportResult> {
    const result: ImportResult = { imported: 0, updated: 0, skipped: 0, errors: [] };

    const parsed: { radioLink: RadioLink }[] = [];
    items.forEach((item, index) => {
      const row = index + 1;
      const { radioLink, error } = parseImportItem(item, row);
      if (radioLink) {
        parsed.push({ radioLink });
      } else {
        result.skipped++;
        result.errors.push(error ?? `Linha ${row}: Dados inválidos.`);
      }
    });

    if (parsed.length === 0) return result;

    const stations = await this.radioLinksRepository.findAllStations();
    const stationIndex = buildStationIndex(stations);

    for (const { radioLink } of parsed) {
      const stationA = resolveStation(
        stationIndex,
        radioLink.siteIdA,
        radioLink.endIdA,
        radioLink.operadoraA,
      );
      if (stationA) applyStationSnapshot(radioLink, stationA, 'A');

      const stationB = resolveStation(
        stationIndex,
        radioLink.siteIdB,
        radioLink.endIdB,
        radioLink.operadoraB,
      );
      if (stationB) applyStationSnapshot(radioLink, stationB, 'B');
    }

    const existing = await this.radioLinksRepository.findExistingNames();
    const byNome = new Map(existing.map((row) => [row.nome, row.id]));

    const pendingInsert = new Map<string, RadioLink>();
    const toUpdate: { id: number; data: Partial<RadioLink> }[] = [];

    for (const { radioLink } of parsed) {
      const existingId = byNome.get(radioLink.nome ?? '');
      if (existingId) {
        toUpdate.push({ id: existingId, data: radioLink });
      } else {
        pendingInsert.set(radioLink.nome ?? '', radioLink);
      }
    }

    if (pendingInsert.size > 0) {
      await this.radioLinksRepository.insertMany([...pendingInsert.values()]);
      result.imported = pendingInsert.size;
    }

    for (const { id, data } of toUpdate) {
      await this.radioLinksRepository.update(id, data);
      result.updated++;
    }

    return result;
  }

  async findAll(query: RadioLinkQuery): Promise<PaginatedRadioLinks> {
    return this.radioLinksRepository.findAll(query);
  }

  async findById(id: number): Promise<RadioLink> {
    const radioLink = await this.radioLinksRepository.findById(id);
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
    const deleted = await this.radioLinksRepository.delete(id);
    if (!deleted) throw new NotFoundException('Enlace de rádio não encontrado');
  }
}
