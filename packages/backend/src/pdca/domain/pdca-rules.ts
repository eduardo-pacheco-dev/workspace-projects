import { Pdca, PdcaProps } from './pdca.entity';
import { PdcaAction } from './pdca-action.entity';

export const PDCA_FASES = ['plan', 'do', 'check', 'act'] as const;
export type PdcaFase = (typeof PDCA_FASES)[number];

export const PDCA_STATUS_CICLO = [
  'aberto',
  'em_execucao',
  'em_verificacao',
  'concluido',
  'cancelado',
] as const;

export const PDCA_TECNICAS_ANALISE = ['5-porques', 'ishikawa', 'livre'] as const;

export const PDCA_STATUS_VALIDACAO = ['sucesso', 'sucesso_parcial', 'falha'] as const;

export const PDCA_STATUS_ACAO = ['pendente', 'em_andamento', 'concluido', 'atrasado'] as const;

const FASE_ORDER: string[] = [...PDCA_FASES];

const STATUS_CONCLUIDO = 'concluido';
const STATUS_CANCELADO = 'cancelado';

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function statusFromFase(fase: string): string {
  switch (fase) {
    case 'do':
      return 'em_execucao';
    case 'check':
    case 'act':
      return 'em_verificacao';
    default:
      return 'aberto';
  }
}

export function validateTransition(
  pdca: Pdca,
  newFase: string,
  counts: { actionCount: number; concludedCount: number },
): string | null {
  const currentIdx = FASE_ORDER.indexOf(pdca.fase);
  const newIdx = FASE_ORDER.indexOf(newFase);
  if (newIdx <= currentIdx) return null;

  if (newFase === 'do') {
    if (!pdca.causaRaiz) {
      return 'Para avançar para Do, preencha a análise da causa raiz (etapa Plan).';
    }
    if (counts.actionCount === 0) {
      return 'Para avançar para Do, crie ao menos uma ação no plano de ação (5W2H).';
    }
  }

  if (newFase === 'check' && counts.concludedCount === 0) {
    return 'Para avançar para Check, ao menos uma ação do plano deve estar concluída.';
  }

  if (newFase === 'act') {
    if (!pdca.resultadoCheck) {
      return 'Para avançar para Act, preencha a avaliação de resultados (etapa Check).';
    }
    if (!pdca.statusValidacao) {
      return 'Para avançar para Act, defina o status da validação (etapa Check).';
    }
  }

  return null;
}

export function isActionOverdue(action: {
  whenPrazo?: string | null;
  status?: string;
}): boolean {
  return (
    !!action.whenPrazo &&
    action.whenPrazo < today() &&
    action.status !== STATUS_CONCLUIDO &&
    action.status !== STATUS_CANCELADO
  );
}

export function attachOverdueFlags(actions: PdcaAction[]): void {
  for (const action of actions) {
    action.atrasado = isActionOverdue(action);
  }
}

export function applyActionStatusTimestamps(action: PdcaAction): void {
  if (action.status === STATUS_CONCLUIDO && !action.dataConclusaoReal) {
    action.dataConclusaoReal = today();
  }
  if (action.status === 'em_andamento' && !action.dataInicioReal) {
    action.dataInicioReal = today();
  }
  if (
    action.status !== STATUS_CONCLUIDO &&
    action.status !== STATUS_CANCELADO &&
    !action.dataConclusaoReal
  ) {
    action.dataConclusaoReal = null;
  }
}

export function applyCycleConclusionDate(pdca: Pdca): void {
  if (pdca.statusCiclo === STATUS_CONCLUIDO && !pdca.dataConclusao) {
    pdca.dataConclusao = today();
  }
}

export function buildRestartProps(source: Pdca): PdcaProps {
  return {
    projectId: source.projectId,
    titulo: `Novo ciclo: ${source.titulo}`,
    problema: source.problema,
    impacto: source.impacto,
    areaSetor: source.areaSetor,
    responsavelCiclo: source.responsavelCiclo,
    tecnicaAnalise: source.tecnicaAnalise,
    cicloPaiId: source.id,
    fase: 'plan',
    statusCiclo: 'aberto',
  };
}
