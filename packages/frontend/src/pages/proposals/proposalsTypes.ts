export interface Proposal {
  id: number
  jobId: number
  freelancerId: number
  coverLetter?: string
  proposedRate: number
  estimatedDuration?: string
  status: string
}

export const proposalStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  accepted: 'Aceita',
  rejected: 'Rejeitada',
  withdrawn: 'Retirada',
}

export const proposalStatusColors: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  pending: 'info',
  accepted: 'success',
  rejected: 'error',
  withdrawn: 'default',
}

export function formatRate(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}
