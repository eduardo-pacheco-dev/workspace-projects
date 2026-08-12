export interface RadioLinkProps {
  id?: number;
  nome?: string;
  frequencia?: string | null;
  capacidade?: string | null;
  stationAId?: number | null;
  siteIdA?: string | null;
  endIdA?: string | null;
  enderecoA?: string | null;
  latitudeA?: number | null;
  longitudeA?: number | null;
  operadoraA?: string | null;
  stationBId?: number | null;
  siteIdB?: string | null;
  endIdB?: string | null;
  enderecoB?: string | null;
  latitudeB?: number | null;
  longitudeB?: number | null;
  operadoraB?: string | null;
  observacoes?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RadioLink {
  id?: number;
  nome?: string;
  frequencia?: string | null;
  capacidade?: string | null;
  stationAId?: number | null;
  siteIdA?: string | null;
  endIdA?: string | null;
  enderecoA?: string | null;
  latitudeA?: number | null;
  longitudeA?: number | null;
  operadoraA?: string | null;
  stationBId?: number | null;
  siteIdB?: string | null;
  endIdB?: string | null;
  enderecoB?: string | null;
  latitudeB?: number | null;
  longitudeB?: number | null;
  operadoraB?: string | null;
  observacoes?: string | null;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: RadioLinkProps) {
    Object.assign(this, { status: 'ativo', ...props });
  }
}
