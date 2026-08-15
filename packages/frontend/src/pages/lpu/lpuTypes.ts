import { formatCurrency } from '../../utils/format'

export interface Lpu {
  id: number
  freelancerId: number
  freelancer?: { id: number; nome: string } | null
  nome: string
  descricao?: string | null
  valor?: number | null
  data?: string | null
  status: string
}

export interface FreelancerOption {
  id: number
  firstName: string
  lastName: string
}

export type LpuSortBy = 'id' | 'nome' | 'valor' | 'data' | 'status' | 'createdAt' | 'freelancer'
export type SortOrder = 'ASC' | 'DESC'

export const LPU_COLUMNS: { id: LpuSortBy; label: string }[] = [
  { id: 'freelancer', label: 'Freelancer' },
  { id: 'nome', label: 'Nome' },
  { id: 'valor', label: 'Valor' },
  { id: 'data', label: 'Data' },
  { id: 'status', label: 'Status' },
]

export const freelancerFullName = (freelancer: FreelancerOption) =>
  `${freelancer.firstName} ${freelancer.lastName}`.trim()

export function formatValor(valor: number | null | undefined): string {
  return valor != null ? formatCurrency(valor) : '-'
}
