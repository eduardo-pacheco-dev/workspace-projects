import { z } from 'zod'

export const projectSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  descricao: z.string().optional(),
  cliente: z.string().optional(),
  operadora: z.string().optional(),
  responsavel: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.string().optional(),
})

export const projectDocumentSchema = z.object({
  nome: z.string().min(1, 'Informe o documento.'),
  tipo: z.string().optional(),
  quantidade: z.preprocess((value) => Number(value), z.number().min(1, 'Informe a quantidade.')).optional(),
  observacoes: z.string().optional(),
})
