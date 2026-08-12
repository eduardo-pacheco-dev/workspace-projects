export interface ServiceOrderProps {
  id?: number;
  numero?: string;
  cliente: string;
  descricao?: string | null;
  siteId?: string | null;
  endId?: string | null;
  operadora?: string | null;
  endereco?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  status?: string;
  observacoes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ServiceOrder {
  id?: number;
  numero?: string;
  cliente: string;
  descricao?: string | null;
  siteId?: string | null;
  endId?: string | null;
  operadora?: string | null;
  endereco?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  status: string;
  observacoes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: ServiceOrderProps) {
    Object.assign(this, { status: 'aberta', ...props });
  }
}
