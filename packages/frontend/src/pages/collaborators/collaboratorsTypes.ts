export interface Collaborator {
  id: number
  codigo: string | null
  nome: string | null
  isFreelancer: boolean
  status: string
  companyId: number
  company?: { id: number; nome: string } | null
  firstName?: string | null
  lastName?: string | null
  cpf?: string | null
  rg?: string | null
  orgaoEmissor?: string | null
  birthDate?: string | null
  naturalidade?: string | null
  sexo?: string | null
  cnpj?: string | null
  tituloEleitor?: string | null
  cnh?: string | null
  cnhValidade?: string | null
  pis?: string | null
  cargo?: string | null
  funcao?: string | null
  razaoSocial?: string | null
  tipoContrato?: string | null
  regional?: string | null
  uf?: string | null
  dataAdmissao?: string | null
  email?: string | null
  telefone?: string | null
  whatsapp?: string | null
  cep?: string | null
  endereco?: string | null
  cidade?: string | null
  contatoEmergenciaNome?: string | null
  contatoEmergenciaTelefone?: string | null
  contatoEmergenciaParentesco?: string | null
  banco?: string | null
  agencia?: string | null
  conta?: string | null
  tipoConta?: string | null
  titular?: string | null
  pix?: string | null
  foto?: string | null
  bio?: string | null
  hourlyRate?: number | null
  skills?: string | null
  experienceLevel?: string | null
  availability?: string | null
  dataAso?: string | null
  dataNr06?: string | null
  dataNr35?: string | null
  dataNr10?: string | null
  dataNr75?: string | null
  dataNr01?: string | null
  dataIntegracao?: string | null
  dataListaFerramental?: string | null
  cracha?: string | null
  dataHs?: string | null
  dataLtw?: string | null
  dataCadastroNokia?: string | null
  dataCadastroEricsson?: string | null
  dataCadastroTelebit?: string | null
  vencimentoAso?: string | null
  vencimentoNr35?: string | null
  vencimentoNr10?: string | null
  uniforms?: string | null
  epis?: string | null
  rgArquivo?: string | null
  carteiraArquivo?: string | null
  habilitacaoArquivo?: string | null
  nr10Arquivo?: string | null
  nr35Arquivo?: string | null
  asoArquivo?: string | null
  epiArquivo?: string | null
  ordemServicoArquivo?: string | null
  contratoArquivo?: string | null
  createdAt?: string
  updatedAt?: string
}

export type SortBy = 'id' | 'codigo' | 'nome' | 'cpf' | 'cargo' | 'email' | 'telefone' | 'status' | 'createdAt'
export type SortOrder = 'ASC' | 'DESC'

export const COLLABORATOR_COLUMNS: { id: SortBy; label: string }[] = [
  { id: 'codigo', label: 'Código' },
  { id: 'nome', label: 'Nome' },
  { id: 'cpf', label: 'CPF' },
  { id: 'cargo', label: 'Cargo' },
  { id: 'email', label: 'Email' },
  { id: 'telefone', label: 'Telefone' },
  { id: 'status', label: 'Status' },
]

export const expLevelMap: Record<string, string> = {
  junior: 'Junior',
  mid: 'Pleno',
  senior: 'Sênior',
  lead: 'Lead',
}

export const availMap: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
  available: { label: 'Disponível', color: 'success' },
  busy: { label: 'Ocupado', color: 'warning' },
  unavailable: { label: 'Indisponível', color: 'error' },
}

export function parseJsonList<T>(value: string | null | undefined): T[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function parseSkills(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split(',').map((s) => s.trim()).filter(Boolean)
}

export function getCollaboratorName(collaborator: Collaborator): string {
  return collaborator.nome || [collaborator.firstName, collaborator.lastName].filter(Boolean).join(' ') || '-'
}
