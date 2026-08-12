export const COLLABORATOR_STATUSES = ['ativo', 'inativo'] as const;
export type CollaboratorStatus = (typeof COLLABORATOR_STATUSES)[number];

export const COLLABORATOR_DOCUMENT_TYPES = [
  'rg',
  'carteira',
  'habilitacao',
  'nr10',
  'nr35',
  'aso',
  'epi',
  'ordemServico',
  'contrato',
] as const;
export type CollaboratorDocumentType = (typeof COLLABORATOR_DOCUMENT_TYPES)[number];

type CollaboratorDocumentField =
  | 'rgArquivo'
  | 'carteiraArquivo'
  | 'habilitacaoArquivo'
  | 'nr10Arquivo'
  | 'nr35Arquivo'
  | 'asoArquivo'
  | 'epiArquivo'
  | 'ordemServicoArquivo'
  | 'contratoArquivo';

export const COLLABORATOR_DOCUMENT_FIELDS: Record<CollaboratorDocumentType, CollaboratorDocumentField> = {
  rg: 'rgArquivo',
  carteira: 'carteiraArquivo',
  habilitacao: 'habilitacaoArquivo',
  nr10: 'nr10Arquivo',
  nr35: 'nr35Arquivo',
  aso: 'asoArquivo',
  epi: 'epiArquivo',
  ordemServico: 'ordemServicoArquivo',
  contrato: 'contratoArquivo',
};

export function buildNome(
  firstName?: string | null,
  lastName?: string | null,
): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}

export function generateCodigo(isFreelancer: boolean, id: number): string {
  return isFreelancer
    ? `FR-${String(id).padStart(4, '0')}`
    : `COL-${String(id).padStart(4, '0')}`;
}

export function isMaster(currentUser?: { role: string } | null): boolean {
  return currentUser?.role === 'master';
}
