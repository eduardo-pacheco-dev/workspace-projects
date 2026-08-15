import { z } from 'zod'

export const pdcaSchema = z.object({
  titulo: z.string().min(1, 'Informe o título.'),
  problema: z.string().optional(),
  impacto: z.string().optional(),
  areaSetor: z.string().optional(),
  responsavelCiclo: z.string().optional(),
  tecnicaAnalise: z.string().optional(),
  causaRaiz: z.string().optional(),
  meta: z.string().optional(),
  resultadoCheck: z.string().optional(),
  kpi: z.string().optional(),
  resultadoMedicao: z.string().optional(),
  statusValidacao: z.string().optional(),
  dataVerificacao: z.string().optional(),
  responsavelValidacao: z.string().optional(),
  decisoesAct: z.string().optional(),
  pop: z.string().optional(),
  licaoAprendida: z.string().optional(),
  observacoes: z.string().optional(),
})

export const pdcaActionSchema = z.object({
  what: z.string().min(1, 'Informe o que fazer.'),
  why: z.string().optional(),
  ondeAplicacao: z.string().optional(),
  whenInicio: z.string().optional(),
  whenPrazo: z.string().optional(),
  who: z.string().optional(),
  how: z.string().optional(),
  howMuch: z.preprocess(
    (value) => (value === '' || value == null ? undefined : Number(value)),
    z.number().optional(),
  ),
  status: z.string().optional(),
  progresso: z.preprocess((value) => Number(value), z.number().min(0, 'Mínimo 0').max(100, 'Máximo 100')).optional(),
  observacoes: z.string().optional(),
})
