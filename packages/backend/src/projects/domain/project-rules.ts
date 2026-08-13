export const PROJECT_STATUSES = ['ativo', 'inativo'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export function generateProjectCodigo(id: number): string {
  return `PRJ-${String(id).padStart(4, '0')}`;
}
