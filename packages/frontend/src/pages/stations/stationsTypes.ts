export interface Station {
  id: number
  siteId: string
  endId: string
  elementType: string | null
  technology: string | null
  areaHolder: string | null
  infraContractType: string | null
  infraHolder: string | null
  infraType: string | null
  evType: string | null
  evSupplier: string | null
  address: string | null
  regional: string | null
  latitude: number | null
  longitude: number | null
  mobileCarrier: string | null
  towerType: string | null
  nominalAev: number | null
  groundArea: number | null
  structureHeight: number | null
  stationId: string | null
  notes: string | null
  status: string
  createdAt?: string
  updatedAt?: string
}

export type StationSortBy = 'id' | 'siteId' | 'endId' | 'address' | 'mobileCarrier' | 'status'
export type SortOrder = 'ASC' | 'DESC'

export const STATION_COLUMNS: { id: StationSortBy; label: string }[] = [
  { id: 'siteId', label: 'Site ID' },
  { id: 'endId', label: 'End ID' },
  { id: 'mobileCarrier', label: 'Operadora' },
  { id: 'address', label: 'Endereço' },
  { id: 'status', label: 'Status' },
]

export const MOBILE_CARRIERS = ['TIM', 'CLARO', 'VIVO', 'Outras']

export const mobileCarrierColors: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  TIM: 'info',
  CLARO: 'warning',
  VIVO: 'success',
  Outras: 'default',
}
