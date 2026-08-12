import { IsArray, ArrayNotEmpty } from 'class-validator';
import { RadioLinkImportItem } from '../domain/radio-link-rules';

export type ImportRadioLinkItem = RadioLinkImportItem;

export class ImportRadioLinksDto {
  @IsArray()
  @ArrayNotEmpty()
  radioLinks: ImportRadioLinkItem[];
}
