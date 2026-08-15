import { z } from 'zod'

const baseSchema = z.object({
  cliente: z.string().min(1, 'Informe o cliente.'),
  descricao: z.string().optional(),
  siteId: z.string().optional(),
  endId: z.string().optional(),
  operadora: z.string().optional(),
  endereco: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  observacoes: z.string().optional(),
})

export const createServiceOrderSchema = baseSchema
export const updateServiceOrderSchema = baseSchema.partial()
