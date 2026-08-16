export interface Job {
  id: number
  nome: string
  tipo: string
  descricao: string | null
  cronExpression: string
  status: string
  ultimoExecutadoEm: string | null
  proximaExecucaoEm: string | null
  empresaId: number | null
  createdAt: string
  updatedAt: string
}

export type ChipColor = 'default' | 'info' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'

export const jobStatusOptions: { value: string; label: string }[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'executando', label: 'Executando' },
]

export const jobStatusLabels: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  executando: 'Executando',
}

export const jobStatusColors: Record<string, ChipColor> = {
  ativo: 'success',
  inativo: 'default',
  executando: 'info',
}

export const jobTipoOptions: { value: string; label: string }[] = [
  { value: 'ECHO', label: 'Echo (teste)' },
  { value: 'CLEANUP_LOGS', label: 'Limpeza de Logs' },
]

export type JobSortBy =
  | 'id'
  | 'nome'
  | 'tipo'
  | 'status'
  | 'ultimoExecutadoEm'
  | 'proximaExecucaoEm'
  | 'createdAt'

export type SortOrder = 'ASC' | 'DESC'

export const JOB_COLUMNS: { id: JobSortBy; label: string }[] = [
  { id: 'nome', label: 'Nome' },
  { id: 'tipo', label: 'Tipo' },
  { id: 'status', label: 'Status' },
  { id: 'ultimoExecutadoEm', label: 'Última Execução' },
  { id: 'proximaExecucaoEm', label: 'Próxima Execução' },
]

export function formatJobDate(value: string | null): string {
  if (!value) return '-'
  const date = new Date(value)
  return isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR')
}