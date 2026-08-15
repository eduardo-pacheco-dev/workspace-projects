import { z } from 'zod'

const baseSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  cnpj: z.string().optional(),
  email: z.string().email('Informe um e-mail válido.').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  ativa: z.boolean().optional(),
  observacoes: z.string().optional(),
})

export const createCompanySchema = baseSchema
export const updateCompanySchema = baseSchema.partial()
