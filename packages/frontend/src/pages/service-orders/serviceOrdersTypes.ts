export interface ServiceOrder {
  id: number
  numero: string
  cliente: string
  descricao: string | null
  siteId: string | null
  endId: string | null
  operadora: string | null
  dataInicio: string | null
  dataFim: string | null
  status: string
  observacoes: string | null
  createdAt?: string
}

export type ServiceOrderSortBy = 'id' | 'numero' | 'cliente' | 'dataInicio' | 'status' | 'siteId' | 'operadora'
export type SortOrder = 'ASC' | 'DESC'

export const SERVICE_ORDER_COLUMNS: { id: ServiceOrderSortBy | 'descricao'; label: string; sortable?: boolean }[] = [
  { id: 'numero', label: 'Número' },
  { id: 'cliente', label: 'Cliente' },
  { id: 'descricao', label: 'Descrição', sortable: false },
  { id: 'siteId', label: 'Site ID' },
  { id: 'operadora', label: 'Operadora' },
  { id: 'dataInicio', label: 'Data de Início' },
  { id: 'status', label: 'Status' },
]

export const statusOptions: { value: string; label: string }[] = [
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
]

export const statusLabels: Record<string, string> = statusOptions.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {},
)

export const statusColors: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  aberta: 'info',
  em_andamento: 'warning',
  concluida: 'success',
  cancelada: 'error',
}

export interface ClientOption {
  id: number
  nome: string
}

export interface StationOption {
  id: number
  siteId: string
  endId: string
  address: string | null
  mobileCarrier: string | null
}

export interface RadioLinkOption {
  id: number
  nome: string
  siteIdA: string | null
  endIdA: string | null
  enderecoA: string | null
  operadoraA: string | null
}

export interface Comment {
  id: number
  content: string
  author: string
  createdAt: string
}

export interface Attachment {
  id: number
  filename: string
  originalName: string
  mimetype: string
  size: number
}

export interface Observation {
  id: number
  title: string
  description: string | null
  filename: string | null
  originalName: string | null
  mimetype: string | null
  size: number | null
  createdAt: string
}
