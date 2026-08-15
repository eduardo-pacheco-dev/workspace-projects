export interface Company {
  id: number
  nome: string
  cnpj: string | null
  email: string | null
  telefone: string | null
  endereco: string | null
  cidade: string | null
  uf: string | null
  ativa: boolean
  observacoes: string | null
  createdAt: string
  updatedAt: string
}

export const ufOptions = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export const emptyCompany = {
  nome: '',
  cnpj: '',
  email: '',
  telefone: '',
  endereco: '',
  cidade: '',
  uf: '',
  ativa: true,
  observacoes: '',
}

export interface CompanyCollaborator {
  id: number
  companyId: number
  nome: string
  cargo: string | null
  email: string | null
  telefone: string | null
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export const emptyCollaborator = {
  nome: '',
  cargo: '',
  email: '',
  telefone: '',
  ativo: true,
}

export interface FreelancerSummary {
  id: number
  firstName: string
  lastName: string
  email?: string | null
  status?: string
  availability?: string
  foto?: string | null
}

export interface CompanyFreelancerLink {
  id: number
  companyId: number
  freelancerId: number
  createdAt: string
  freelancer: FreelancerSummary
}

export interface ProjectSummary {
  id: number
  nome: string
  codigo: string | null
  descricao: string | null
  cliente: string | null
  dataInicio: string | null
  dataFim: string | null
  status: string
}

export type CompanySortBy = 'id' | 'nome' | 'cnpj' | 'email' | 'cidade' | 'uf' | 'ativa'
export type SortOrder = 'ASC' | 'DESC'

export const COMPANY_COLUMNS: { id: CompanySortBy; label: string }[] = [
  { id: 'nome', label: 'Nome' },
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'email', label: 'E-mail' },
  { id: 'cidade', label: 'Cidade' },
  { id: 'uf', label: 'UF' },
  { id: 'ativa', label: 'Status' },
]

export interface CompanyAttachment {
  id: number
  filename: string
  originalName: string
  mimetype: string
  size: number
}

export interface CompanyComment {
  id: number
  content: string
  author: string
  createdAt: string
}
