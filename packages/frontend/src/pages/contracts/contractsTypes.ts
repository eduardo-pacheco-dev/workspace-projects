export interface Contract {
  id: number
  proposalId?: number
  jobId: number
  freelancerId: number
  clientId: number
  startDate: string
  endDate?: string
  totalBudget: number
  status: string
}

export const contractStatusLabels: Record<string, string> = {
  active: 'Ativo',
  pending: 'Pendente',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export const contractStatusColors: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  active: 'success',
  pending: 'info',
  completed: 'default',
  cancelled: 'error',
}

export function formatBudget(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export function formatContractDate(value: string | undefined): string {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  return isNaN(date.getTime()) ? value.slice(0, 10) : date.toLocaleDateString('pt-BR')
}
