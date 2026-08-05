import { IsArray, ArrayNotEmpty } from 'class-validator';

export interface ImportStationItem {
  siteId?: string;
  endId?: string;
  endereco?: string;
  latitude?: number;
  longitude?: number;
  operadora?: string;
  observacoes?: string;
  status?: string;
}

export class ImportStationsDto {
  @IsArray()
  @ArrayNotEmpty()
  stations: ImportStationItem[];
}
