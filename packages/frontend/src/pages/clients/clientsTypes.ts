export interface Client {
  id: number
  nome: string
  documento: string | null
  email: string | null
  telefone: string | null
  endereco: string | null
  cidade: string | null
  uf: string | null
  observacoes: string | null
  status: string
  createdAt?: string
  updatedAt?: string
}

export type SortBy = 'id' | 'nome' | 'documento' | 'email' | 'telefone' | 'cidade' | 'status'
export type SortOrder = 'ASC' | 'DESC'

export const CLIENT_COLUMNS: { id: SortBy; label: string }[] = [
  { id: 'nome', label: 'Nome' },
  { id: 'documento', label: 'CNPJ' },
  { id: 'email', label: 'Email' },
  { id: 'telefone', label: 'Telefone' },
  { id: 'cidade', label: 'Cidade' },
  { id: 'status', label: 'Status' },
]

export interface Responsavel {
  id: number
  clientId: number
  nome: string
  sobrenome: string
  email: string | null
  telefone: string | null
  funcao: string | null
}

export interface ClientComment {
  id: number
  content: string
  author: string
  createdAt: string
}
