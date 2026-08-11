import { Station } from './station.entity';

export const STATION_REPOSITORY = 'STATION_REPOSITORY';

export interface StationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  operadora?: string;
}

export interface PaginatedStations {
  data: Station[];
  total: number;
}

export interface StationRef {
  id: number;
  siteId: string;
  endId: string;
}

export interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface StationRepository {
  create(station: Station): Promise<Station>;
  findAll(query: StationQuery): Promise<PaginatedStations>;
  findById(id: number): Promise<Station | null>;
  findExistingRefs(): Promise<StationRef[]>;
  insertMany(stations: Station[]): Promise<void>;
  update(id: number, station: Station): Promise<void>;
  delete(id: number): Promise<boolean>;
}
