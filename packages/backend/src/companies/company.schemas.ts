import { z } from 'zod';

export const createCompanySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório.'),
  cnpj: z.string().optional(),
  email: z.string().email('Informe um e-mail válido.').optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  ativa: z.boolean().optional(),
  observacoes: z.string().optional(),
});

export const updateCompanySchema = z
  .object({
    nome: z.string().min(1, 'Nome é obrigatório.').optional(),
    cnpj: z.string().optional(),
    email: z.string().email('Informe um e-mail válido.').optional(),
    telefone: z.string().optional(),
    endereco: z.string().optional(),
    cidade: z.string().optional(),
    uf: z.string().optional(),
    ativa: z.boolean().optional(),
    observacoes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
