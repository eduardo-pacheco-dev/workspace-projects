export interface Project {
  id: number
  nome: string
  codigo: string | null
  descricao: string | null
  cliente: string | null
  operadora: string | null
  responsavel: string | null
  dataInicio: string | null
  dataFim: string | null
  observacoes: string | null
  status: string
  companies?: { id: number; nome: string }[]
  createdAt?: string
  updatedAt?: string
}

export type ProjectSortBy = 'id' | 'nome' | 'codigo' | 'cliente' | 'dataInicio' | 'status'
export type SortOrder = 'ASC' | 'DESC'

export const PROJECT_COLUMNS: { id: ProjectSortBy | 'dataFim'; label: string; sortable?: boolean }[] = [
  { id: 'nome', label: 'Nome' },
  { id: 'codigo', label: 'Código' },
  { id: 'cliente', label: 'Cliente' },
  { id: 'dataInicio', label: 'Início' },
  { id: 'dataFim', label: 'Término', sortable: false },
  { id: 'status', label: 'Status' },
]

export const OPERADORAS = ['TIM', 'CLARO', 'VIVO', 'Outras']

export function formatProjectDate(value: string | null): string {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  return isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR')
}

export function companyLabel(project: Project): string {
  const names = (project.companies ?? []).map((c) => c.nome).filter(Boolean)
  return names.length ? names.join(', ') : '-'
}

export function terminoLabel(dataFim: string | null): string {
  return dataFim ? formatProjectDate(dataFim) : 'Indeterminado'
}

export interface ProjectDocument {
  id: number
  nome: string
  tipo: string | null
  quantidade: number
  observacoes: string | null
}

export interface ProjectComment {
  id: number
  content: string
  author: string
  createdAt: string
}

export interface ProjectStation {
  id: number
  siteId: string
  endId: string
  address: string | null
  mobileCarrier: string | null
  status: string
}

export interface ProjectRadioLink {
  id: number
  nome: string
  frequencia: string | null
  capacidade: string | null
  siteIdA: string | null
  siteIdB: string | null
  operadoraA: string | null
  operadoraB: string | null
}
