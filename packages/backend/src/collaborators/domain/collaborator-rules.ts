export const COLLABORATOR_STATUSES = ['ativo', 'inativo'] as const;
export type CollaboratorStatus = (typeof COLLABORATOR_STATUSES)[number];

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
