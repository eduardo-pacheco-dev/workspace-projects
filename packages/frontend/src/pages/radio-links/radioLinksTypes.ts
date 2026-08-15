export interface RadioLink {
  id: number
  nome: string
  frequencia: string | null
  capacidade: string | null
  siteIdA: string | null
  endIdA: string | null
  enderecoA: string | null
  latitudeA: number | null
  longitudeA: number | null
  operadoraA: string | null
  siteIdB: string | null
  endIdB: string | null
  enderecoB: string | null
  latitudeB: number | null
  longitudeB: number | null
  operadoraB: string | null
  observacoes: string | null
  status: string
  createdAt?: string
  updatedAt?: string
}

export type RadioLinkSortBy = 'id' | 'nome' | 'frequencia' | 'capacidade' | 'siteIdA' | 'siteIdB' | 'status'
export type SortOrder = 'ASC' | 'DESC'

export const RADIO_LINK_COLUMNS: { id: RadioLinkSortBy; label: string }[] = [
  { id: 'nome', label: 'Nome' },
  { id: 'frequencia', label: 'Frequência' },
  { id: 'capacidade', label: 'Capacidade' },
  { id: 'siteIdA', label: 'Estação A' },
  { id: 'siteIdB', label: 'Estação B' },
  { id: 'status', label: 'Status' },
]

export const operadoraColors: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  TIM: 'info',
  CLARO: 'warning',
  VIVO: 'success',
  Outras: 'default',
}

export interface LinkStationOption {
  id: number
  siteId: string
  endId: string
  mobileCarrier: string | null
}
