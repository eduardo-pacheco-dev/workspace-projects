export const STATION_OPERADORAS = ['TIM', 'CLARO', 'VIVO', 'Outras'] as const;
export type StationOperadora = (typeof STATION_OPERADORAS)[number];

export const STATION_STATUSES = ['ativo', 'inativo'] as const;
export type StationStatus = (typeof STATION_STATUSES)[number];

export interface StationProps {
  id?: number;
  siteId: string;
  endId?: string | null;
  endereco?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  operadora?: string | null;
  observacoes?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Station {
  readonly id?: number;
  siteId: string;
  endId: string;
  endereco?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  operadora?: string | null;
  observacoes?: string | null;
  status: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: StationProps) {
    this.id = props.id;
    this.siteId = props.siteId;
    this.endId = props.endId ?? '';
    this.endereco = props.endereco;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.operadora = props.operadora;
    this.observacoes = props.observacoes;
    this.status = props.status ?? 'ativo';
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get isTim(): boolean {
    return !this.operadora || this.operadora.trim() === '' || this.operadora === 'TIM';
  }

  applyEndIdRule(): void {
    if (!this.isTim) {
      this.endId = '';
    }
  }

  static fromProps(props: StationProps): Station {
    const station = new Station(props);
    station.applyEndIdRule();
    return station;
  }
}
