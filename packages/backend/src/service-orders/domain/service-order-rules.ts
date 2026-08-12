export const SERVICE_ORDER_STATUSES = [
  'aberta',
  'em_andamento',
  'concluida',
  'cancelada',
] as const;

export const OPERADORA_OPTIONS = ['TIM', 'CLARO', 'VIVO', 'Outras'] as const;

export function generateServiceOrderNumero(id: number): string {
  return `OS-${String(id).padStart(3, '0')}`;
}
