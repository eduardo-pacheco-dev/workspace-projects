export const STATION_MOBILE_CARRIERS = ['TIM', 'CLARO', 'VIVO', 'Outras'] as const;
export type StationMobileCarrier = (typeof STATION_MOBILE_CARRIERS)[number];

export const STATION_STATUSES = ['ativo', 'inativo'] as const;
export type StationStatus = (typeof STATION_STATUSES)[number];

export interface StationProps {
  id?: number;
  siteId: string;
  endId?: string | null;
  elementType?: string | null;
  technology?: string | null;
  areaHolder?: string | null;
  infraContractType?: string | null;
  infraHolder?: string | null;
  infraType?: string | null;
  evType?: string | null;
  evSupplier?: string | null;
  address?: string | null;
  regional?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mobileCarrier?: string | null;
  status?: string;
  towerType?: string | null;
  nominalAev?: number | null;
  groundArea?: number | null;
  structureHeight?: number | null;
  stationId?: string | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Station {
  readonly id?: number;
  siteId: string;
  endId: string;
  elementType?: string | null;
  technology?: string | null;
  areaHolder?: string | null;
  infraContractType?: string | null;
  infraHolder?: string | null;
  infraType?: string | null;
  evType?: string | null;
  evSupplier?: string | null;
  address?: string | null;
  regional?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mobileCarrier?: string | null;
  status: string;
  towerType?: string | null;
  nominalAev?: number | null;
  groundArea?: number | null;
  structureHeight?: number | null;
  stationId?: string | null;
  notes?: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: StationProps) {
    this.id = props.id;
    this.siteId = props.siteId;
    this.endId = props.endId ?? '';
    this.elementType = props.elementType;
    this.technology = props.technology;
    this.areaHolder = props.areaHolder;
    this.infraContractType = props.infraContractType;
    this.infraHolder = props.infraHolder;
    this.infraType = props.infraType;
    this.evType = props.evType;
    this.evSupplier = props.evSupplier;
    this.address = props.address;
    this.regional = props.regional;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.mobileCarrier = props.mobileCarrier;
    this.status = props.status ?? 'ativo';
    this.towerType = props.towerType;
    this.nominalAev = props.nominalAev;
    this.groundArea = props.groundArea;
    this.structureHeight = props.structureHeight;
    this.stationId = props.stationId;
    this.notes = props.notes;
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
