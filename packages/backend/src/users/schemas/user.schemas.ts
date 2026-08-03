import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  lastName: z.string().optional(),
  email: z.string().min(1, 'Email é obrigatório.').email('Email inválido.'),
  phone: z.string().optional(),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
  role: z.enum(['master', 'user']).optional(),
  companyId: z.number().int().positive().nullable().optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório.').optional(),
    lastName: z.string().optional(),
    email: z.string().min(1, 'Email é obrigatório.').email('Email inválido.').optional(),
    phone: z.string().optional(),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.').optional(),
    status: z.enum(['active', 'inactive'], 'Status inválido.').optional(),
    role: z.enum(['master', 'user']).optional(),
    companyId: z.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
