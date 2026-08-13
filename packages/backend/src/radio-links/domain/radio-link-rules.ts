import { RadioLink } from './radio-link.entity';
import { StationRef } from './radio-link.repository';

export const RADIO_LINK_OPERADORAS = ['TIM', 'CLARO', 'VIVO', 'Outras'] as const;
export const RADIO_LINK_STATUSES = ['ativo', 'inativo'] as const;

export interface RadioLinkImportItem {
  nome?: string;
  frequencia?: string;
  capacidade?: string;
  siteIdA?: string;
  endIdA?: string;
  enderecoA?: string;
  latitudeA?: number | string;
  longitudeA?: number | string;
  operadoraA?: string;
  siteIdB?: string;
  endIdB?: string;
  enderecoB?: string;
  latitudeB?: number | string;
  longitudeB?: number | string;
  operadoraB?: string;
  observacoes?: string;
  status?: string;
}

export interface StationIndex {
  bySiteId: Map<string, StationRef>;
  bySiteAndEnd: Map<string, StationRef>;
}

function cleanStr(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function parseCoordinate(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export function parseImportItem(
  item: RadioLinkImportItem,
  row: number,
): { radioLink?: RadioLink; error?: string } {
  const nome = typeof item.nome === 'string' ? item.nome.trim() : '';
  if (!nome) {
    return { error: `Linha ${row}: Nome é obrigatório.` };
  }

  return {
    radioLink: new RadioLink({
      nome,
      frequencia: cleanStr(item.frequencia),
      capacidade: cleanStr(item.capacidade),
      siteIdA: cleanStr(item.siteIdA),
      endIdA: cleanStr(item.endIdA),
      enderecoA: cleanStr(item.enderecoA),
      latitudeA: parseCoordinate(item.latitudeA),
      longitudeA: parseCoordinate(item.longitudeA),
      operadoraA: cleanStr(item.operadoraA),
      siteIdB: cleanStr(item.siteIdB),
      endIdB: cleanStr(item.endIdB),
      enderecoB: cleanStr(item.enderecoB),
      latitudeB: parseCoordinate(item.latitudeB),
      longitudeB: parseCoordinate(item.longitudeB),
      operadoraB: cleanStr(item.operadoraB),
      observacoes: cleanStr(item.observacoes),
      status: item.status === 'inativo' ? 'inativo' : 'ativo',
    }),
  };
}

export function buildStationIndex(stations: StationRef[]): StationIndex {
  const bySiteId = new Map<string, StationRef>();
  const bySiteAndEnd = new Map<string, StationRef>();
  for (const station of stations) {
    if (station.siteId) bySiteId.set(station.siteId, station);
    if (station.siteId && station.endId) {
      bySiteAndEnd.set(`${station.siteId}::${station.endId}`, station);
    }
  }
  return { bySiteId, bySiteAndEnd };
}

export function resolveStation(
  index: StationIndex,
  siteId: string | null | undefined,
  endId: string | null | undefined,
  operadora: string | null | undefined,
): StationRef | null {
  if (!siteId) return null;
  if (operadora === 'TIM' && endId) {
    return index.bySiteAndEnd.get(`${siteId}::${endId}`) ?? index.bySiteId.get(siteId) ?? null;
  }
  return index.bySiteId.get(siteId) ?? null;
}

export function applyStationSnapshot(radioLink: RadioLink, station: StationRef, end: 'A' | 'B'): void {
  if (end === 'A') {
    radioLink.stationAId = station.id;
    radioLink.siteIdA = station.siteId;
    radioLink.endIdA = station.endId;
    radioLink.enderecoA = station.address;
    radioLink.latitudeA = station.latitude;
    radioLink.longitudeA = station.longitude;
    radioLink.operadoraA = station.mobileCarrier;
  } else {
    radioLink.stationBId = station.id;
    radioLink.siteIdB = station.siteId;
    radioLink.endIdB = station.endId;
    radioLink.enderecoB = station.address;
    radioLink.latitudeB = station.latitude;
    radioLink.longitudeB = station.longitude;
    radioLink.operadoraB = station.mobileCarrier;
  }
}
