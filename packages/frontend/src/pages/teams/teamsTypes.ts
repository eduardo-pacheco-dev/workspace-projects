export interface TeamMember {
  id: number
  collaboratorId: number
  collaborator?: {
    id: number
    nome: string | null
    firstName?: string | null
    lastName?: string | null
    isFreelancer: boolean
  }
}

export interface Team {
  id: number
  nome: string
  descricao: string | null
  status: string
  members: TeamMember[]
  createdAt: string
}

export interface CollaboratorOption {
  id: number
  nome: string | null
  firstName?: string | null
  lastName?: string | null
  cargo?: string | null
  isFreelancer: boolean
}

export type SortBy = 'id' | 'nome' | 'status' | 'createdAt'
export type SortOrder = 'ASC' | 'DESC'

export const TEAM_COLUMNS: { id: SortBy; label: string }[] = [
  { id: 'nome', label: 'Nome' },
  { id: 'status', label: 'Status' },
]

export function getMemberName(
  collaborator: Pick<CollaboratorOption, 'nome' | 'firstName' | 'lastName'> | undefined,
  collaboratorId?: number,
): string {
  if (!collaborator) return collaboratorId != null ? `#${collaboratorId}` : '-'
  return collaborator.nome || [collaborator.firstName, collaborator.lastName].filter(Boolean).join(' ') || '-'
}
