import { Station } from './station.entity';

export const TIM_OPERADORA = 'TIM';

export interface StationImportItem {
  siteId?: string;
  endId?: string;
  endereco?: string;
  latitude?: number | string;
  longitude?: number | string;
  operadora?: string;
  observacoes?: string;
  status?: string;
}

export interface ParsedImportStation {
  station: Station;
}

export function requiresEndId(operadora?: string | null): boolean {
  return !operadora || operadora.trim() === '' || operadora === TIM_OPERADORA;
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
  const operadora =
    typeof item.operadora === 'string' && item.operadora.trim()
      ? item.operadora.trim()
      : undefined;
  const endId = typeof item.endId === 'string' ? item.endId.trim() : '';
  const needsEndId = requiresEndId(operadora);

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
      endereco: cleanStr(item.endereco),
      latitude: parseCoordinate(item.latitude),
      longitude: parseCoordinate(item.longitude),
      operadora,
      observacoes: cleanStr(item.observacoes),
      status: normalizeStatus(item.status),
    }),
  };
}
