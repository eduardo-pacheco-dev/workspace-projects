import { IsArray, ArrayNotEmpty } from 'class-validator';

export interface ImportRadioLinkItem {
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

export class ImportRadioLinksDto {
  @IsArray()
  @ArrayNotEmpty()
  radioLinks: ImportRadioLinkItem[];
}
