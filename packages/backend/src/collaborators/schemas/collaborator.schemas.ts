import { z } from 'zod';

export const createCollaboratorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório.'),
  cpf: z.string().optional(),
  cargo: z.string().optional(),
  email: z.string().email('Email inválido.').optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  dataAdmissao: z.string().optional(),
  status: z.enum(['ativo', 'inativo']).optional(),
});

export const updateCollaboratorSchema = z
  .object({
    nome: z.string().min(1, 'Nome é obrigatório.').optional(),
    cpf: z.string().optional(),
    cargo: z.string().optional(),
    email: z.string().email('Email inválido.').optional(),
    telefone: z.string().optional(),
    endereco: z.string().optional(),
    cidade: z.string().optional(),
    uf: z.string().optional(),
    dataAdmissao: z.string().optional(),
    status: z.enum(['ativo', 'inativo']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type CreateCollaboratorInput = z.infer<typeof createCollaboratorSchema>;
export type UpdateCollaboratorInput = z.infer<typeof updateCollaboratorSchema>;
