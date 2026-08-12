import { RadioLink, RadioLinkProps } from './radio-link.entity';

export const RADIO_LINK_REPOSITORY = 'RADIO_LINK_REPOSITORY';

export interface RadioLinkQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  operadora?: string;
}

export interface PaginatedRadioLinks {
  data: RadioLink[];
  total: number;
}

export interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface StationRef {
  id: number;
  siteId: string;
  endId: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mobileCarrier?: string | null;
}

export interface RadioLinkRepository {
  create(radioLink: RadioLink): Promise<RadioLink>;
  save(radioLink: RadioLink): Promise<RadioLink>;
  findAll(query: RadioLinkQuery): Promise<PaginatedRadioLinks>;
  findById(id: number): Promise<RadioLink | null>;
  delete(id: number): Promise<boolean>;
  findStationById(id: number): Promise<StationRef | null>;
  findAllStations(): Promise<StationRef[]>;
  findExistingNames(): Promise<{ id: number; nome: string }[]>;
  insertMany(radioLinks: RadioLink[]): Promise<void>;
  update(id: number, data: Partial<RadioLinkProps>): Promise<void>;
}
