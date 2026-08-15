import { z } from 'zod'

const baseSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  documento: z.string().optional(),
  email: z.string().email('Informe um e-mail válido.').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  status: z.enum(['ativo', 'inativo']).optional(),
  observacoes: z.string().optional(),
})

export const createClientSchema = baseSchema
export const updateClientSchema = baseSchema.partial()

export const responsavelSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  sobrenome: z.string().min(1, 'Informe o sobrenome.'),
  email: z.string().optional(),
  telefone: z.string().optional(),
  funcao: z.string().optional(),
})
