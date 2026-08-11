import { IsArray, ArrayNotEmpty } from 'class-validator';
import { StationImportItem } from '../domain/station-rules';

export type ImportStationItem = StationImportItem;

export class ImportStationsDto {
  @IsArray()
  @ArrayNotEmpty()
  stations: ImportStationItem[];
}
