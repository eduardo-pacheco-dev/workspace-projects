export interface User {
  id: number
  name: string
  lastName: string | null
  email: string
  phone: string | null
  status: string
  role?: string
  companyId?: number | null
  companyName?: string | null
  createdAt: string
}

export interface UserProfile {
  id: number
  name: string
  lastName: string | null
  email: string
  phone: string | null
  status: string
  createdAt: string
}

export type SortBy = 'id' | 'name' | 'lastName' | 'email' | 'phone' | 'status' | 'createdAt'
export type SortOrder = 'ASC' | 'DESC'
export type ViewMode = 'table' | 'cards'

export const USER_COLUMNS: { id: SortBy; label: string }[] = [
  { id: 'name', label: 'Nome' },
  { id: 'lastName', label: 'Sobrenome' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Telefone' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Criado em' },
]
