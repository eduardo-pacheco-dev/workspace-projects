import { z } from 'zod';

export const createTeamSchema = z.object({
  nome: z.string().min(1, 'Informe o nome da equipe.'),
  descricao: z.string().optional(),
  status: z.enum(['ativo', 'inativo']).optional(),
});

export const updateTeamSchema = z
  .object({
    nome: z.string().min(1, 'Informe o nome da equipe.').optional(),
    descricao: z.string().optional(),
    status: z.enum(['ativo', 'inativo']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const addMemberSchema = z.object({
  collaboratorId: z.number().int().positive('Informe o colaborador.'),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
