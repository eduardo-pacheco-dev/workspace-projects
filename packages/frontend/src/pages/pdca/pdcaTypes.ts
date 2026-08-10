export interface Pdca {
  id: number
  projectId: number | null
  titulo: string
  problema: string | null
  impacto: string | null
  areaSetor: string | null
  responsavelCiclo: string | null
  tecnicaAnalise: string | null
  causaRaiz: string | null
  meta: string | null
  fase: string
  statusCiclo: string
  resultadoCheck: string | null
  kpi: string | null
  resultadoMedicao: string | null
  statusValidacao: string | null
  dataVerificacao: string | null
  responsavelValidacao: string | null
  decisoesAct: string | null
  pop: string | null
  licaoAprendida: string | null
  observacoes: string | null
  dataConclusao: string | null
  cicloPaiId: number | null
  actions?: PdcaAction[]
  createdAt: string
  updatedAt: string
}

export interface PdcaAction {
  id: number
  pdcaId: number
  what: string
  why: string | null
  ondeAplicacao: string | null
  whenInicio: string | null
  whenPrazo: string | null
  who: string | null
  how: string | null
  howMuch: number | null
  status: string
  progresso: number
  observacoes: string | null
  dataInicioReal: string | null
  dataConclusaoReal: string | null
  atrasado?: boolean
  createdAt: string
  updatedAt: string
}

export const faseOptions: { value: string; label: string }[] = [
  { value: 'plan', label: 'Plan (Planejar)' },
  { value: 'do', label: 'Do (Executar)' },
  { value: 'check', label: 'Check (Checar)' },
  { value: 'act', label: 'Act (Agir)' },
]

export const statusCicloOptions: { value: string; label: string }[] = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'em_execucao', label: 'Em Execução' },
  { value: 'em_verificacao', label: 'Em Verificação' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

export const statusAcaoOptions: { value: string; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'atrasado', label: 'Atrasado' },
]

export const tecnicaOptions: { value: string; label: string }[] = [
  { value: '5-porques', label: '5 Porquês' },
  { value: 'ishikawa', label: 'Ishikawa (Espinha de Peixe)' },
  { value: 'livre', label: 'Campo Livre' },
]

export const statusValidacaoOptions: { value: string; label: string }[] = [
  { value: 'sucesso', label: 'Sucesso' },
  { value: 'sucesso_parcial', label: 'Sucesso Parcial' },
  { value: 'falha', label: 'Falha' },
]

const labelsFrom = (options: { value: string; label: string }[]): Record<string, string> =>
  options.reduce((acc, o) => ({ ...acc, [o.value]: o.label }), {})

export const faseLabels = labelsFrom(faseOptions)
export const statusCicloLabels = labelsFrom(statusCicloOptions)
export const statusAcaoLabels = labelsFrom(statusAcaoOptions)
export const tecnicaLabels = labelsFrom(tecnicaOptions)
export const statusValidacaoLabels = labelsFrom(statusValidacaoOptions)

type ChipColor = 'default' | 'info' | 'primary' | 'success' | 'warning' | 'error'

export const faseColors: Record<string, ChipColor> = {
  plan: 'info',
  do: 'primary',
  check: 'warning',
  act: 'success',
}

export const statusCicloColors: Record<string, ChipColor> = {
  aberto: 'default',
  em_execucao: 'info',
  em_verificacao: 'warning',
  concluido: 'success',
  cancelado: 'error',
}

export const statusAcaoColors: Record<string, ChipColor> = {
  pendente: 'default',
  em_andamento: 'info',
  concluido: 'success',
  atrasado: 'error',
}

export const statusValidacaoColors: Record<string, ChipColor> = {
  sucesso: 'success',
  sucesso_parcial: 'warning',
  falha: 'error',
}
