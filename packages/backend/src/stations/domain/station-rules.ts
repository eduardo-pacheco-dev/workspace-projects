import { Station } from './station.entity';

export const TIM_MOBILE_CARRIER = 'TIM';

export interface StationImportItem {
  siteId?: string;
  endId?: string;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
  mobileCarrier?: string;
  notes?: string;
  status?: string;
}

export interface ParsedImportStation {
  station: Station;
}

export function requiresEndId(mobileCarrier?: string | null): boolean {
  return !mobileCarrier || mobileCarrier.trim() === '' || mobileCarrier === TIM_MOBILE_CARRIER;
}

export function buildStationKey(siteId: string, endId: string): string {
  return `${siteId}::${endId}`;
}

export function normalizeStatus(value?: string): string {
  return value === 'inativo' ? 'inativo' : 'ativo';
}

export function parseCoordinate(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function cleanStr(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function parseImportItem(
  item: StationImportItem,
  row: number,
): { station?: Station; error?: string } {
  const siteId = typeof item.siteId === 'string' ? item.siteId.trim() : '';
  const mobileCarrier =
    typeof item.mobileCarrier === 'string' && item.mobileCarrier.trim()
      ? item.mobileCarrier.trim()
      : undefined;
  const endId = typeof item.endId === 'string' ? item.endId.trim() : '';
  const needsEndId = requiresEndId(mobileCarrier);

  if (!siteId || (needsEndId && !endId)) {
    return {
      error: needsEndId
        ? `Linha ${row}: Site ID e End ID são obrigatórios.`
        : `Linha ${row}: Site ID é obrigatório.`,
    };
  }

  return {
    station: new Station({
      siteId,
      endId: needsEndId ? endId : '',
      address: cleanStr(item.address),
      latitude: parseCoordinate(item.latitude),
      longitude: parseCoordinate(item.longitude),
      mobileCarrier,
      notes: cleanStr(item.notes),
      status: normalizeStatus(item.status),
    }),
  };
}
