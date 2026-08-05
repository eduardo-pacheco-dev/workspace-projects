import { IsArray, ArrayNotEmpty } from 'class-validator';

export interface ImportStationItem {
  siteId?: string;
  endId?: string;
  endereco?: string;
  latitude?: number | string;
  longitude?: number | string;
  operadora?: string;
  observacoes?: string;
  status?: string;
}

export class ImportStationsDto {
  @IsArray()
  @ArrayNotEmpty()
  stations: ImportStationItem[];
}
