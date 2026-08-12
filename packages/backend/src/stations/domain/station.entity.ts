export const STATION_MOBILE_CARRIERS = ['TIM', 'CLARO', 'VIVO', 'Outras'] as const;
export type StationMobileCarrier = (typeof STATION_MOBILE_CARRIERS)[number];

export const STATION_STATUSES = ['ativo', 'inativo'] as const;
export type StationStatus = (typeof STATION_STATUSES)[number];

export interface StationProps {
  id?: number;
  siteId: string;
  endId?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mobileCarrier?: string | null;
  notes?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Station {
  readonly id?: number;
  siteId: string;
  endId: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mobileCarrier?: string | null;
  notes?: string | null;
  status: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: StationProps) {
    this.id = props.id;
    this.siteId = props.siteId;
    this.endId = props.endId ?? '';
    this.address = props.address;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.mobileCarrier = props.mobileCarrier;
    this.notes = props.notes;
    this.status = props.status ?? 'ativo';
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get isTim(): boolean {
    return !this.mobileCarrier || this.mobileCarrier.trim() === '' || this.mobileCarrier === 'TIM';
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
